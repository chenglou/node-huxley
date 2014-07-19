'use strict';

var fsP = require('../fileOps/fsP');
var Promise = require('bluebird');
var outputDiffP = require('./outputDiffP');

function update(buf, p) {
  fsP.writeFileAsync(p, buf);
}

function diff(a, b, diffPath) {
  return outputDiffP(a, b)
    .then(function(args) {
      var diffMetric = args[0];
      var buf = args[1];
      if (diffMetric === 0) {
        return Promise.resolve();
      }

      return fsP
        .writeFileAsync(diffPath, buf)
        .then(function() {
          return Promise.reject(new Error('Different screenshot! ' + diffPath));
        });
    });
}

module.exports = {
  diff: diff,
  update: update,
};
