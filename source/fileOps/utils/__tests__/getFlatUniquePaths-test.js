var expect = require('expect');
var getFlatUniquePaths;

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

describe('getFlatUniquePaths', function() {
  beforeEach(function() {
    getFlatUniquePaths = require('../getFlatUniquePaths');
  });

  it('gets the paths', function(done) {
    var expected = [
      'fixture/Huxleyfile.json',
      'fixture/nested/Huxleyfile.json',
    ];
    compare(
      getFlatUniquePaths,
      [__dirname + '/../../__tests__/fixture/**/Huxleyfile.json'],
      expected,
      done
    );
  });

  it('dedupes paths', function(done) {
    var glob = __dirname + '/../../__tests__/fixture/**/Huxleyfile.json';
    var expected = [
      'fixture/Huxleyfile.json',
      'fixture/nested/Huxleyfile.json',
    ];
    compare(getFlatUniquePaths, [glob, glob], expected, done);
  });
});
