'use strict';

var Promise = require('bluebird');
var PNGDiff = require('png-diff');

var concat = require('concat-stream');

function outputDiffP(a, b) {
  var prom = new Promise(function(resolve, reject) {
    PNGDiff.outputDiffStream(a, b, function(err, outputStream, diffMetric) {
      if (err) {
        reject(err);
        return;
      }
      var buf = concat(function(data) {
        resolve([diffMetric, data]);
      });
      outputStream.pipe(buf);
    });
  });

  return prom;
}

module.exports = outputDiffP;
