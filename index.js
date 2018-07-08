var config = require('config');
const router = require('express')();
const program = require('commander');
var Lib = require('./lib/Lib');

var PORT = 'port' in config ? config.port : 9000;
var TIMEOUT = 60; // seconds
var REQUEST_ERRORS_MAX = 'request_errors_max' in config ? config.request_errors_max : 2;
var REQUEST_ERRORS = 0;

var id_stoppoint = 'default_stoppoint_id' in config ? config.default_stoppoint_id : '940GZZLUWLO';
var id_line_id = 'default_line_id' in config ? config.default_line_id : 'bakerloo';

var state = {data: []};

var push_arrivals = () => {
  var display_format = 'display_format' in config ? config.display_format :
                        '{platformName}\n{expectedArrival}: {towards}  | {timeToStation}';
  var arrivals = [];
  var arrivals_max = 'following_arrivals_max' in config ? config.following_arrivals_max : 5;
  for (i = 0; i < arrivals_max; i++) {
    if (i >= state.data.length)
      break;
    var d = state.data[i];
    var arrival_text = Lib.format_data(display_format, d);
    arrivals.push(arrival_text);
  }
  Lib.send_following_arrivals(id_stoppoint, id_line, arrivals);
}

// queue predictions for announcement
var queue_announcements = () => {
  var announce_format = 'announce_format' in config ? config.announce_format :
                        "the train arriving at {platformName} is the {expectedArrival} {lineName} service towards {towards}";
  var data = state.data;
  for (var i = data.length - 1; i >= 0; i--) {
    var d = data[i];
    var announce_text = format_data(announce_format, d);
    var announce_timer_id = setTimeout(() => {((d, announce_text, state) => {
        Lib.send_arrival(d.naptanId, d.lineId, announce_text);
        state.data = state.data.filter((o) => { return o.id != d.id; });
        console.log(`removed id: ${d.id} from arrivals queue [count: ${state.data.length}]`);
      })(d, announce_text, state)}, d.timeToStation * 1000);
    d.announce_timer_id = announce_timer_id; // TODO: race condition
  }
}

var refresh = () => {
  console.log("stoppoint-id: " + id_stoppoint + " | line-id: " + id_line);
  Promise.resolve(Lib.get_data(id_stoppoint, id_line, state))
    .then((data) => {
      if (data == "200") {
        REQUEST_ERRORS = 0;
        push_arrivals();
        queue_announcements();
      }
      else {
        REQUEST_ERRORS++;
        if (REQUEST_ERRORS >= REQUEST_ERRORS_MAX) {
          console.log(`\ntoo many (>${REQUEST_ERRORS_MAX}) request errors`);
          process.exit();
        }
      }
    });
}

var run = (args) => {
  program
    .command("demo")
    .usage("[options]")
    .option("-s, --stoppointid <required>", "stop-point id")
    .option("-l, --lineid <required>", "line id")
    .parse(args);

  var help = (program) => {
    console.log('%s', program.helpInformation());
  };

  if (program.commands[0].stoppointid)
    id_stoppoint = program.commands[0].stoppointid
  else {
    help(program);
    console.log(`no stoppoint id specified, defaulting to '${id_stoppoint}'!`);
  }
  if (program.commands[0].lineid)
    id_line = program.commands[0].lineid
  else {
    help(program);
    console.log(`no line id specified, defaulting to '${id_line}'!`);
  }

  // update now!
  refresh();

  // listen for send_arrival requests
  router.get("/", (req, res) => {
    var msgs = [];
    var update = false;
    if ("stoppoint_id" in req.query) {
      update = true;
      msgs.push(`stoppoint-id updated: '${req.query.stoppoint_id}'`);
    }
    if ("line_id" in req.query) {
      update = true;
      msgs.push(`line-id updated: '${req.query.line_id}'`);
    }
    Promise.resolve(update ? Lib.get_data(req.query.stoppoint_id || id_stoppoint,
                                          req.query.line_id || id_line,
                                          state) : false)
      .then((data) => {
        debugger;
        if (data) {
          if (data == "200") {
            // set global ids
            id_stoppoint = req.query.stoppoint_id || id_stoppoint;
            id_line = req.query.line_id || id_line;
          }
          else
            // short-circuit
            res.send("error updating feed state, check ids!");
        }
        if ("arrival" in req.query) {
          var data = Lib.send_arrival(id_stoppoint, id_line, JSON.stringify(state.data));
          msgs.push(JSON.stringify(data));
        } else if ("arrivals" in req.query) {
          var data = Lib.send_arrival(id_stoppoint, id_line, JSON.stringify(state.data));
          msgs.push(JSON.stringify(data));
        }
        res.send(msgs.join("\n"));
      });
  });
  router.listen(PORT);

  // push following arrivals on interval
  setInterval(push_arrivals, TIMEOUT * 1000);
}

run(process.argv);
