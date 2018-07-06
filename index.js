
const program = require('commander');
var Lib = require('./lib/Lib');

var TIMEOUT = 30; // seconds
var REQUEST_ERRORS_MAX = 2;
var REQUEST_ERRORS = 0;

var id_stoppoint = "stoppoint-id";
var id_line = "line-id";

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

  id_stoppoint = program.commands[0].stoppointid
  id_line = program.commands[0].lineid

  var help = (program) => {
    console.log('%s', program.helpInformation());
  };

  if (!id_stoppoint) {
    help(program);
    console.log("missing stoppoint id!");
    process.exit();
  }
  if (!id_line) {
    help(program);
    console.log("missing line id!");
    process.exit();
  }

  // update now!
  refresh();
  // update on interval
  setInterval(refresh, TIMEOUT * 1000);
}

run(process.argv);
