var fs = require('fs');
var exec = require('child_process').exec;

function writeToFile(path, rawImageBuffer, done) {
  var imageBuffer = new Buffer(rawImageBuffer, 'base64');
  fs.writeFile(path, imageBuffer, done);
}

function compareAndSaveDiffOnMismatch(image1Buffer, image2Path, taskPath, done) {
  // in our use case, iamge1Buffer will always be a buffer of the temp image we
  // created
  var tempFileName = 'temp' + Math.random() + '.png';
  writeToFile(tempFileName, image1Buffer, function(err) {
    try {
      _checkIfDifferent(tempFileName, image2Path, function(err, areSame) {
        if (!areSame) {
          var diffPath = taskPath + '/diff.png';
          _saveDiffImage(tempFileName, image2Path, diffPath, function(err) {
            fs.unlink(tempFileName, function(err2) {
              done(err || err2, areSame);
            });
          });
        } else {
          fs.unlink(tempFileName, function() {
            done(null, areSame);
          });
        }
      });
    } catch (e) {
      fs.unlinkSync(tempFileName);
      throw e;
    }
  });
}

function _checkIfDifferent(image1Path, image2Path, done) {
  exec('gm compare -metric mse ' + image1Path + ' ' + image2Path, function (err, stdout) {
    // TODO: throw?
    if (err) return done(err);

    // the output is an ascii table, with the last row like this:
    // Total: 0.0000607584        0.0
    //           ^ what we want
    var match = /Total: (\d+\.?\d*)/m.exec(stdout);
    if (!match) {
      // TODO: throw?
      err = new Error('Unable to parse output.\nGot ' + stdout);
      return done(err);
    }

    var equality = parseFloat(match[1]);
    done(err, equality === 0);
  });
}

function _saveDiffImage(image1Path, image2Path, diffPath, done) {
  exec(
    'gm compare -file ' + diffPath + ' ' + image1Path + ' ' + image2Path, done
  );
}

module.exports = {
  writeToFile: writeToFile,
  compareAndSaveDiffOnMismatch: compareAndSaveDiffOnMismatch,
};
