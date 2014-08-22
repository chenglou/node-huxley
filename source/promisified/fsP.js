'use strict';

var Promise = require('bluebird');

var fs = require('fs');

var fsP = Promise.promisifyAll(fs);

// `fs.exists` is a legacy API (our use-case is legit and convenient here) that
// calls the callback directly with (result) rather than (error, result).
// Normalize it here
fsP.existsAsync = function(a) {
  var prom = new Promise(function(resolve) {
    fs.exists(a, function(exists) {
      resolve(exists);
    });
  });

  return prom;
};

module.exports = fsP;
