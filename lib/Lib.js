const moment = require('moment');
const https = require('https');
const path = require('path');

module.exports = Lib = {}

TARGET_ARRIVALS = '../data/arrivals';
TARGET_FOLLOWING_ARRIVALS = '../data/following_arrivals';

var dump_data = (target, stoppoint_id, line_id, data) => {
  // write to timestamped file
  timestamp = moment().format("YYYYMMDD_HHmmss");
  file = path.join(target, timestamp);
  console.log(`dumping to file: ${file}`)
  return file;
}

Lib.send_arrival = (text) => {
  res = dump_data(TARGET_ARRIVALS, text);
  return res;
}

Lib.send_following_arrivals = (texts) => {
  // tab delimit
  dump_data(TARGET_FOLLOWING_ARRIVALS, texts.join("\t"));
}

Lib.get_data = (id_stoppoint, id_line) => {

  var url = `https://api.tfl.gov.uk/Line/${id_line}/Arrivals/${id_stoppoint}?direction=inbound`;
  console.log(`querying: ${url}`);

  const options = {
    hostname: 'api.tfl.gov.uk',
    port: 443,
    path: `/Line/${id_line}/Arrivals/${id_stoppoint}?direction=inbound`,
    method: 'GET'
  };
  const req = https.request(options, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });

  req.on('error', (e) => {
    console.error(e);
    return res.statusCode;
  });
  req.end();

}
