var config = require('config');
const router = require('express')();
const program = require('commander');
const fs = require('fs');
var Lib = require('./lib/Lib');

var PORT = 'port' in config ? config.port : 9000;
var TIMEOUT = 60; // seconds
var REQUEST_ERRORS_MAX = 'request_errors_max' in config ? config.request_errors_max : 2;
var REQUEST_ERRORS = 0;

var id_stoppoint = 'default_stoppoint_id' in config ? config.default_stoppoint_id : '940GZZLUWLO';
var id_line = 'default_line_id' in config ? config.default_line_id : 'bakerloo';

var state = {raw: "", data: []};
var updates_on = true; // testing/debugging
var push_empty_on = true; // whether empty arrivals sets are pushed

// items of interest
const ioi = [
  'id',
  'lineId',
  'naptanId',
  'expectedArrival',
  'lineName',
  'platformName',
  'destinationName',
  'timeToStation',
  'towards'
];

var push_arrivals = () => {
  return Promise.resolve(state.data.length == 0 ? refresh() : true)
    .then(() => {
      var arrivals = [];
      if (state.data.length == 0)
        console.log(`no arrivals pending. refreshing in ${TIMEOUT} seconds`);
      else {
        var display_format = 'display_format' in config ? config.display_format :
                              '{platformName}\n{expectedArrival}: {lineName} -> {towards} | {timeToStation}';
        var arrivals_max = 'following_arrivals_max' in config ? config.following_arrivals_max : 5;
        for (i = 0; i < arrivals_max; i++) {
          if (i >= state.data.length)
            break;
          var d = state.data[i];
          var arrival_text = Lib.format_data(display_format, d);
          arrivals.push(arrival_text);
        }
      }
      if (push_empty_on || state.data.length > 0)
        return Lib.send_following_arrivals(id_stoppoint, id_line, arrivals);
    });
}

// remove prediction
var remove_prediction = (id) => {
  return new Promise((resolve, reject) => {
    state.data = state.data.filter((o) => { return o.id != id; });
    console.log(`removed id: ${id} from arrivals queue [count: ${state.data.length}]`);
    if (state.data.length == 0)
      Promise.resolve(refresh())
        .then(resolve);
    else
      resolve();
  });
}

// queue predictions for announcement
var queue_announcements = () => {
  var announce_format = 'announce_format' in config ? config.announce_format :
                        "the train arriving at {platformName} is the {expectedArrival} {lineName} service towards {towards}";
  var data = state.data;
  for (var i = data.length - 1; i >= 0; i--) {
    var d = data[i];
    var announce_text = format_data(announce_format, d);
    var announce_timer_id = setTimeout(() => {((d, announce_text, update) => {
        Lib.send_arrival(d.naptanId, d.lineId, announce_text);
        update(d.id);
      })(d, announce_text, remove_prediction)}, d.timeToStation * 1000);
    d.announce_timer_id = announce_timer_id; // TODO: race condition
  }
}

// process raw json blob
var process_data = () => {
  //console.log("processing data");
  //process.stdout.write(data);
  var data = [];
  if (state.raw) {
    var d = JSON.parse(state.raw);
    var data = []
    d.forEach((prediction) => {
      prediction2 = {};
      ioi.forEach((i) => { prediction2[i] = prediction[i]; });
      data.push(prediction2);
    });
    data.sort((a, b) => a['timeToStation'] - b['timeToStation']); // in place
  }
  state['data'] = data;
};

var refresh = () => {
  if (!updates_on)
     return;

  console.log("refreshing arrival predictions for stoppoint-id: " + id_stoppoint + " | line-id: " + id_line);
  return Promise.resolve(Lib.get_data(id_stoppoint, id_line, state))
    .then((data) => {
      if (data == "200") {
        REQUEST_ERRORS = 0;
        process_data();
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
  else
    console.log(`no stoppoint id specified, defaulting to '${id_stoppoint}'!`);

  if (program.commands[0].lineid)
    id_line = program.commands[0].lineid
  else
    console.log(`no line id specified, defaulting to '${id_line}'!`);

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
        return Promise.resolve("arrivals" in req.query ? push_arrivals() : false)
          .then((dump_file) => {
            if (dump_file) {
              msgs.push('arrivals:');
              data = fs.readFileSync(dump_file, 'utf8').split('\n');
              msgs = msgs.concat(data);
            }
            res.send(msgs.join("<br>"));
            return;
          });
      });
  });
  router.listen(PORT);
  // push following arrivals on interval
  setInterval(push_arrivals, TIMEOUT * 1000);

  // update empty state now!
  push_arrivals();
}

if (require.main === module)
  run(process.argv);
