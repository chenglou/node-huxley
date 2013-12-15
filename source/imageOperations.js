'use strict';

var exec = require('child_process').exec;
var fs = require('fs');
var PNGDiff = require('png-diff');

var consts = require('./constants');

function writeToFile(path, rawImageBuffer, done) {
  var imageBuffer = new Buffer(rawImageBuffer, 'base64');
  fs.writeFile(path, imageBuffer, done);
}

function compareAndSaveDiffOnMismatch(image1Buffer,
                                      image2Path,
                                      taskPath,
                                      done) {
  // in our use case, iamge1Buffer will always be a buffer of the temp image we
  // created
  var tempFileName = 'temp' + Math.random() + '.png';

  writeToFile(tempFileName, image1Buffer, function(err) {
    PNGDiff.measureDiff(tempFileName, image2Path, function(err, diffMetric) {
      if (err) {
        fs.unlinkSync(tempFileName);
        return done(err);
      }

      var areSame = diffMetric === 0;
      if (!areSame) {
        var diffPath = taskPath + '/' + consts.DIFF_PNG_NAME;
        PNGDiff.outputDiff(tempFileName, image2Path, diffPath, function(err) {
          done(err, areSame);
        });
      } else {
        done(err, areSame);
      }
      fs.unlinkSync(tempFileName);
    });
  });
}

function removeDanglingImages(taskPath, index, done) {
  // a new recording might take less screenshots than the previous
  var imagePath = taskPath + '/' + index + '.png';
  if (!fs.existsSync(imagePath)) return done();

  fs.unlink(imagePath, function(err) {
    if (err) return done(err);

    removeDanglingImages(taskPath, index + 1, done);
  });
}

module.exports = {
  writeToFile: writeToFile,
  compareAndSaveDiffOnMismatch: compareAndSaveDiffOnMismatch,
  removeDanglingImages: removeDanglingImages
};
