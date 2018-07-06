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

Lib.send_arrival = (id_stoppoint, id_line, text) => {
  return dump_data(id_stoppoint, id_line, TARGET_ARRIVALS, text);
};

Lib.send_following_arrival = (id_stoppoint, id_line, texts) => {
  // new line delimit
  return dump_data(id_stoppoint, id_line, TARGET_FOLLOWING_ARRIVALS, texts.join("\n"));
};

Lib.process_data = process_data = (json, state) => {
  // maintain latest state
  //console.log("processing data");
  //process.stdout.write(data);
  data = JSON.parse(json);
  state['data'] = data;
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
        process_data(data, state);
        resolve(res.statusCode);
      });
    });
    req.on('error', (e) => {
      console.error(e);
      reject(res.statusCode);
    })
    req.end();

  });
};
