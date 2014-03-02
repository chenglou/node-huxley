'use strict';

var fs = require('fs');
var path = require('path');
var PNGDiff = require('png-diff');

var consts = require('./constants');

function getImageName(browserName, imageIndex) {
  // image format will be 'firefox-1.png'
  return browserName + '-' + imageIndex + '.png';
}

function writeToFile(path, rawImageBuffer, next) {
  var imageBuffer = new Buffer(rawImageBuffer, 'base64');
  fs.writeFile(path, imageBuffer, next);
}

function compareAndSaveDiffOnMismatch(
  image1Buffer,
  image2Path,
  taskPath,
  next
) {
  // in our use case, iamge1Buffer will always be a buffer of the temp image we
  // created
  var tempFileName = 'temp' + Math.random() + '.png';

  writeToFile(tempFileName, image1Buffer, function(err) {
    PNGDiff.measureDiff(tempFileName, image2Path, function(err, diffMetric) {
      if (err) {
        fs.unlinkSync(tempFileName);
        return next(err);
      }

      var areSame = diffMetric === 0;
      if (!areSame) {
        var diffPath = path.join(taskPath, consts.DIFF_PNG_NAME);
        PNGDiff.outputDiff(tempFileName, image2Path, diffPath, function(err) {
          fs.unlinkSync(tempFileName);
          next(err, areSame);
        });
      } else {
        fs.unlinkSync(tempFileName);
        next(null, areSame);
      }
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

module.exports = {
  compareAndSaveDiffOnMismatch: compareAndSaveDiffOnMismatch,
  getImageName: getImageName,
  removeDanglingImages: removeDanglingImages,
  writeToFile: writeToFile
};
