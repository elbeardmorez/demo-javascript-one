var config = require('config');
const moment = require('moment');
const https = require('https');
const path = require('path');
const fs = require('fs');

module.exports = Lib = {}

DATA = 'data';
TARGET_ARRIVALS = 'arrivals';
TARGET_FOLLOWING_ARRIVALS = 'following_arrivals';

var dump_data = (id_stoppoint, id_line, target, data) => {
  // write to timestamped file
  timestamp = moment().format("YYYYMMDD_HHmmss");
  file = path.join(DATA, [[timestamp, id_stoppoint, id_line].join('_'), target].join("."));
  console.log(`dumping to file: ${file}`)
  fs.writeFile(file, data, (error) => {
    if (error != null)
      console.error(error);
  });
  return file;
};

Lib.format_data = format_data = (format, data) => {
  // munge data items into given format
  var res = format;
  Object.keys(data).forEach((k) => {
    v = data[k];
    if (k == 'timeToStation') {
      v = parseInt(v / 60) + 1;
      v = v == 1 ? v + "min" : v + "mins";
    }
    else if (k == 'expectedArrival') {
      time_format = 'time_format' in config ? config.time_format : 'HH:mm';
      v = moment(v).format(time_format);
    }
    res = res.replace(new RegExp('{' + k + '}', 'g'), v);
  });
  return res;
};

Lib.send_arrival = (id_stoppoint, id_line, text) => {
  return dump_data(id_stoppoint, id_line, TARGET_ARRIVALS, text);
};

Lib.send_following_arrivals = (id_stoppoint, id_line, texts) => {
  // new line delimit
  return dump_data(id_stoppoint, id_line, TARGET_FOLLOWING_ARRIVALS, texts.join("\n"));
};

Lib.get_data = (id_stoppoint, id_line, state) => {

  return new Promise((resolve, reject) => {

    var url = `https://api.tfl.gov.uk/Line/${id_line}/Arrivals/${id_stoppoint}?direction=inbound`;
    console.log(`querying: ${url}`);
    const options = {
      hostname: 'api.tfl.gov.uk',
      port: 443,
      path: `/Line/${id_line}/Arrivals/${id_stoppoint}?direction=inbound`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    var data = "";
    const req = https.request(options, (res) => {
      //console.log('statusCode:', res.statusCode);
      //console.log('headers:', res.headers);
      res.setEncoding("utf8");
      res.on('data', (d) => {
        //console.log("response data");
        data += d;
      });
      res.on('end', () => {
        //console.log("response end");
        state.raw = data;
        resolve(res.statusCode);
      });
    });
    req.on('error', (e) => {
      console.error(e);
      reject(-1); // e.g. for EAI_AGAIN DNS lookup timed out error
    })
    req.end();

  });
};
