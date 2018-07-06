
const program = require('commander');

var TIMEOUT = 1; // seconds

var id_stoppoint = "stop-point";
var id_line = "line";

var refresh = () => {
  console.log("stoppoint-id: " + id_stoppoint + " | line-id: " + id_line);
}

var run = (args) {
  program
    .command("demo")
    .usage("[options]")
    .option("-s, --stoppointid <required>", "stop-point id")
    .option("-l, --lineid <required>", "line id")
    .parse(process.argv);

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

  // refresh state on interval
  setInterval(refresh, TIMEOUT * 1000);
}

run(process.argv);
