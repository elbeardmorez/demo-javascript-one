var rewire = require('rewire');

var data = { data: [{
  destinationName: 'Elephant & Castle Underground Station',
  expectedArrival: '2018-07-08T07:47:53Z',
  id: '253952329',
  lineId: 'bakerloo',
  lineName: 'Bakerloo',
  naptanId: '940GZZLUWLO',
  platformName: 'Southbound - Platform 4',
  timeToStation: 149,
  towards: 'Elephant and Castle'
}]}

describe("Demo", function() {
  var demo = rewire('../../index.js');
  beforeEach(() => {
    demo.__set__('updates_on', false);
    demo.__set__('id_stoppoint', '940GZZLUWLO');
    demo.__set__('id_line', 'bakerloo');
  });

  describe("# command line args", function() {
    it('sets ids', () => {
			demo.__get__('run')(["dummy_command", "dummy_module", "-s", "stop-x", "-l", "line-y"]);
			expect(demo.__get__('id_line')).toEqual("line-y");
			expect(demo.__get__('id_stoppoint')).toEqual("stop-x");
		});
	});

 describe("# remove_predictions", function() {
    beforeAll(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    beforeEach(() => {
      state = Object.assign({}, data);
      demo.__set__('state', state);
    });

    it("removes a predition from the state data", function() {
			demo.__get__('remove_prediction')('253952329');
			expect(demo.__get__('state').data.length).toEqual(0);
    });

    it("removes the last predition expecting an update to be triggered", function(done) {
      demo.__set__('updates_on', true);
      Promise.resolve(demo.__get__('remove_prediction')('253952329'))
        .then(() => {
          expect(demo.__get__('state').data.length).toBeGreaterThan(0);
          done();
        });
    });
  });
});

describe("Lib", function() {
  var Lib = require('../../lib/Lib');
  const fs = require('fs');

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  describe("# get_data", function() {
    it("gets arrival data from tfl", function(done) {
      var state = {}
      Promise.resolve(Lib.get_data("940GZZLUWLO", "bakerloo", state))
        .then((data) => {
           expect(data).toEqual(200);
           expect(Object.keys(state).length).toBeGreaterThan(0);
           done();
        });
    });
  });

  describe("# send_arrival", function() {
    it("sends an arrival announcement", function() {
      Lib.send_arrival("940GZZLUWLO", "bakerloo", "data")
        .then((res) => {
          expect(fs.existsSync(res)).toBe(true);
        });
    });
  });

  describe("# send_following_arrivals", function() {
    it("sends following arrivals information", function() {
      Lib.send_following_arrivals("940GZZLUWLO", "bakerloo", ["data", "data2"])
        .then((res) => {
          expect(fs.existsSync(res)).toBe(true);
        });
    });
  });

  describe("# format_data", function() {
    it("merges data items to a format string", function() {
      result = Lib.format_data({'towards': "Upminster"}, "towards {towards}");
      expect(result).toEqual("towards Upminster");
    });
  });
});
