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


var state = {}

var refresh = () => {
  console.log("stoppoint-id: " + id_stoppoint + " | line-id: " + id_line);
  Promise.resolve(Lib.get_data(id_stoppoint, id_line, state))
    .then((data) => {
      if (data == "200") {
        REQUEST_ERRORS = 0;
        Lib.send_arrival(id_stoppoint, id_line, JSON.stringify(state.data));
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

  // update on interval
  setInterval(refresh, TIMEOUT * 1000);
}

run(process.argv);
