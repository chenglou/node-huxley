var gm = require('gm');
var fs = require('fs');
var exec = require('child_process').exec;

function writeToFile(path, rawImageBuffer, callback) {
  var imageBuffer = new Buffer(rawImageBuffer, 'base64');
  fs.writeFile(path, imageBuffer, callback);
}

function compareAndSaveDiffOnMismatch(image1Buffer, image2Path, taskPath, callback) {
  // in our use case, iamge1Buffer will always be a buffer of the temp image we
  // created
  var tempFileName = 'temp' + Math.random() + '.png';
  writeToFile(tempFileName, image1Buffer, function(err) {
    try {
      // pixel perfect, leaves no room for error (the 0)
      gm.compare(tempFileName, image2Path, 0, function(err, areSame) {
        if (!areSame) {
          // waiting for gm to accept the pull on diff saving. Meanwhile...
          var diffPngPath = taskPath + '/diff.png';
          exec(
            'gm compare -file ' + diffPngPath + ' ' + tempFileName + ' ' + image2Path,
            function(err) {
              fs.unlink(tempFileName, function() {
                callback(err, areSame);
              });
            }
          );
        } else {
          fs.unlink(tempFileName, function() {
            callback(null, areSame);
          });
        }
      });
    } catch (e) {
      fs.unlinkSync(tempFileName);
      throw e;
    }
  });
}

module.exports = {
  writeToFile: writeToFile,
  compareAndSaveDiffOnMismatch: compareAndSaveDiffOnMismatch,
};
