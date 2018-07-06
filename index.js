
const router = require('express')();
const program = require('commander');
var Lib = require('./lib/Lib');

var PORT = 9000;
var TIMEOUT = 30; // seconds
var REQUEST_ERRORS_MAX = 2;
var REQUEST_ERRORS = 0;

var id_stoppoint = "940GZZLUWLO";
var id_line = "bakerloo";

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
    if ("arrival" in req.query) {
      var data = Lib.send_arrival(id_stoppoint, id_line, JSON.stringify(state.data));
      res.send(JSON.stringify(data));
    } else if ("arrivals" in req.query) {
      var data = Lib.send_arrival(id_stoppoint, id_line, JSON.stringify(state.data));
      res.send(JSON.stringify(data));
    }
  });
  router.listen(PORT);

  // update on interval
  setInterval(refresh, TIMEOUT * 1000);
}

run(process.argv);
