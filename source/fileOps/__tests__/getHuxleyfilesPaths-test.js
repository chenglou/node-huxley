var expect = require('expect');
var getHuxleyfilesPaths;

function compare(func, globs, expected, done) {
  func(globs)
    .then(function(res) {
      expect(expected.length).toBe(res.length);
      expected.forEach(function(e, i) {
        expect(res[i].indexOf(e) >= 0).toBe(true);
      });
    })
    .then(function() {
      done();
    });
}

describe('getHuxleyfilesPaths', function() {
  beforeEach(function() {
    getHuxleyfilesPaths = require('../getHuxleyfilesPaths');
  });

  it('gets the paths', function(done) {
    var expected = [
      'fixture/Huxleyfile.json',
      'fixture/nested/Huxleyfile.json',
    ];
    compare(getHuxleyfilesPaths, [__dirname + '/fixture/**'], expected, done);
  });

  it('dedupes paths', function(done) {
    var glob = __dirname + '/fixture/**';
    var expected = [
      'fixture/Huxleyfile.json',
      'fixture/nested/Huxleyfile.json',
    ];
    compare(getHuxleyfilesPaths, [glob, glob], expected, done);
  });
});
