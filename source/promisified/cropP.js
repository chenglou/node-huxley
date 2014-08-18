'use strict';

var Promise = require('bluebird');
var PNGCrop = require('png-crop');

var concat = require('concat-stream');

// config example: {height: 100, width: 40, top: 15, left: 20}
// top and left optional
function crop(stream, config, cb) {
  PNGCrop.cropToStream(stream, config, function(err, outputStream) {
    var buf = concat(function(data) {
      cb(err, data);
    });
    outputStream.pipe(buf);
  });
}

var cropP = Promise.promisify(crop);

module.exports = cropP;
