'use strict';

var Promise = require('bluebird');

var fsP = require('../promisified/fsP');
var mkdirpP = require('../promisified/mkdirpP');
var outputDiffP = require('../promisified/outputDiffP');
var path = require('path');

function update(buf, p) {
  return mkdirpP(path.dirname(p))
    .then(function() {
      return fsP.writeFileAsync(p, buf);
    });
}

function diff(a, b, diffPath) {
  return outputDiffP(a, b)
    .spread(function(diffMetric, buf) {
      if (diffMetric === 0) {
        return Promise.resolve();
      }

      var err = {
        name: 'DifferentScreenshot',
        message: 'Different screenshot!',
        diffPath: diffPath
      };
      return fsP
        .writeFileAsync(diffPath, buf)
        .then(function() {
          return Promise.reject(err);
        });
    });
}

module.exports = {
  diff: diff,
  update: update,
};
