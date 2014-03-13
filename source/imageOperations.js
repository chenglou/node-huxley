'use strict';

var fs = require('fs');
var path = require('path');
var PNGCrop = require('png-crop');
var PNGDiff = require('png-diff');
var streamifier = require('streamifier');

var consts = require('./constants');

function getImageName(browserName, imageIndex) {
  // image format will be 'firefox-1.png'
  return browserName + '-' + imageIndex + '.png';
}

function save(imageStream, path, next) {
  imageStream
    .pipe(fs.createWriteStream(path))
    .once('error', next)
    .on('close', next);
}

function compareAndSaveDiffOnMismatch(
  image1Stream,
  image2Path,
  taskPath,
  next
) {
  var diffPath = path.join(taskPath, consts.DIFF_PNG_NAME);
  PNGDiff.outputDiffStream(image1Stream, image2Path, function(err, outputStream, diffMetric) {
    var areSame = diffMetric === 0;
    if (areSame) {
      return next(null, areSame);
    }
    outputStream.pipe(fs.createWriteStream(diffPath))
      .once('error', next)
      .on('close', function() {
        return next(err, areSame);
      });
  });
}

// a new recording might take less screenshots than the previous
function removeDanglingImages(taskPath, browserName, startIndex, next) {
  var imagePath = path.join(taskPath, getImageName(browserName, startIndex));
  if (!fs.existsSync(imagePath)) return next();

  fs.unlink(imagePath, function(err) {
    if (err) return next(err);

    removeDanglingImages(taskPath, browserName, startIndex + 1, next);
  });
}

// config example: {height: 100, width: 40, top: 15, left: 20}
// top and left optional
function cropToStream(imageStream, config, next) {
  PNGCrop.cropToStream(imageStream, config, next);
}

function turnRawImageStringIntoStream(rawImageString) {
  return streamifier.createReadStream(new Buffer(rawImageString, 'base64'));
}

module.exports = {
  compareAndSaveDiffOnMismatch: compareAndSaveDiffOnMismatch,
  cropToStream: cropToStream,
  getImageName: getImageName,
  removeDanglingImages: removeDanglingImages,
  save: save,
  turnRawImageStringIntoStream: turnRawImageStringIntoStream
};
