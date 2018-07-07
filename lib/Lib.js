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

Lib.process_data = process_data = (json, state) => {
  // maintain latest state
  //console.log("processing data");
  //process.stdout.write(data);
  var data = JSON.parse(json);
  var data2 = []
  data.forEach(prediction => {
    prediction2 = {};
    ioi.forEach((i) => { prediction2[i] = prediction[i]; });
    data2.push(prediction2);
  });
  data2.sort((a, b) => {a['timeToStation'] - b['timeToStation']}); // in place
  // queue for announcement
  var announce_format = 'announce_format' in config ? config.announce_format :
                        "the train arriving at {platformName} is the {expectedArrival} {lineName} service towards {towards}";
  state['data'] = data2;
  for (var i = data2.length - 1; i >= 0; i--) {
    var d = data2[i];
    var announce_text = format_data(announce_format, d);
    var announce_timer_id = setTimeout(() => {((d, announce_text, state) => {
        Lib.send_arrival(d.naptanId, d.lineId, announce_text);
        state.data = state.data.filter((o) => { return o.id != d.id; });
        console.log(`removed id: ${d.id} from arrivals queue [count: ${state.data.length}]`);
      })(d, announce_text, state)}, d.timeToStation * 1000);
    d.announce_timer_id = announce_timer_id; // TODO: race condition
  }
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
