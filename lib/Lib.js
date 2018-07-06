function Lib() {}

TARGET_ARRIVALS = '../data/arrivals';
TARGET_FOLLOWING_ARRIVALS = '../data/following_arrivals';

var dump_data = (target, datat) => {
  // write to file
  // timestamp files
}

Lib.send_arrival = (text) => {
  dump_data(TARGET_ARRIVALS, text)
}

Lib.send_following_arrivals = (texts) => {
  // tab delimit
  dump_data(TARGET_FOLLOWING_ARRIVALS, texts.join("\t"))
}

module.exports = Lib;
