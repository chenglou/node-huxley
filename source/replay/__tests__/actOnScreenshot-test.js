'use strict';

var expect = require('expect');

var actOnScreenshot;
var fs;
var path;
var fsP;

describe('actOnScreenshot', function() {
  beforeEach(function() {
    actOnScreenshot = require('../actOnScreenshot');
    fs = require('fs');
    fsP = require('../../promisified/fsP');
    path = require('path');
  });

  it('diffs', function(done) {
    var pj = path.join.bind(null, __dirname);

    var img1 = fs.readFileSync(pj('fixture/1.png'));
    var img2 = fs.readFileSync(pj('fixture/2.png'));
    var dest = pj('diff.png');
    var errPath = pj('youShouldntSeeThis.png');

    actOnScreenshot.diff(img1, img2, dest)
      .then(function() {
        done('This should have errored and saved a diff.');
      })
      .catch(function(err) {
        expect(err.name).toBe('DifferentScreenshot');
        var res = fs.readFileSync(dest);
        var expectedDiff = fs.readFileSync(pj('fixture/expectedDiff.png'));
        return actOnScreenshot.diff(res, expectedDiff, errPath);
      })
      .then(function() {
        done();
      }, done)
      .finally(function() {
        fs.unlinkSync(dest);
      });
  });
});
