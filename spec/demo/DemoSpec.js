
/*
describe("Demo", function() {
  var demo = require('../../index.js');

  describe("# cmd line args", function() {
    it('exits 0', () => {
			result = demo.run(["sddfgs", "sdfa"]);
			expect(false).toBeTruthy();
		});
	});
});
*/

describe("Lib", function() {
  var Lib = require('../../lib/Lib');
  const fs = require('fs');

  describe("# get arrival data", function() {
    it("get_data", function() {
      result = Lib.get_data("940GZZLUWLO", "bakerloo");
      expect(result).toEqual(200);
    });
  });

  describe("# send_arrival", function() {
    it("send_Arrival", function() {
      result = Lib.send_arrival("data");
      expect(fs.existsSync(result)).toBe(true);
    });
  });
});
