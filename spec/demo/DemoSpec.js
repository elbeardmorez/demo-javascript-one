var fs = require('fs');

describe("Lib", function() {
  var demo = require('../../index.js');

  describe("# cmd line args", function() {
    it('exits 0', () => {
			result = demo.run(["sddfgs", "sdfa"]);
			expect(false).toBeTruthy();
		});
	});
}

describe("Lib", function() {
  var Lib = require('../../lib/Lib');
  var lib;

  beforeEach(function() {
    lib = new Lib();
  });

  describe("# send_arrival", function() {
    it("send_Arrival", function() {
      result = lib.("data")
      fs.exists(result, (exists) => {
        expect().toBeFalsy();
      });
    });
  });
});
