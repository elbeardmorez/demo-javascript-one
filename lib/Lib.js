const moment = require('moment');

function Lib() {}

TARGET_ARRIVALS = '../data/arrivals';
TARGET_FOLLOWING_ARRIVALS = '../data/following_arrivals';

var dump_data = (target, stoppoint_id, line_id, data) => {
  // write to timestamped file
  timestamp = moment().format("YYYYMMDD_HHmmss");
  file = path.join(target, timestamp);
}

Lib.send_arrival = (text) => {
  res = dump_data(TARGET_ARRIVALS, text);
}

Lib.send_following_arrivals = (texts) => {
  // tab delimit
  dump_data(TARGET_FOLLOWING_ARRIVALS, texts.join("\t"));
}

Lib.get_data(stop_id) {

}

module.exports = Lib;
