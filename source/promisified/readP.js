'use strict';

var Promise = require('bluebird');

var read = require('read');

// without this, we'd get: readP(...).then(cb) where callback will receive an
// one array arguments of the original arguments to make bluebird passes back
// the single argument without the array wrapper, we make the callback only take
// one argument (excluding the mandatory first error argument)
function readWith1ArgumentCb(opts, cb) {
  return read(opts, function(err, a, b) {
    cb(err, a);
  });
}

module.exports = Promise.promisify(readWith1ArgumentCb);
