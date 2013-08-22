var gm = require('gm');
var fs = require('fs');

function writeImageToFile(path, rawImage, callback) {
  var imageBuffer = new Buffer(rawImage, 'base64');
  fs.writeFile(pathAndName, imageBuffer, callback);
}

function compareImages(image1, image2, callback) {
  // pixel perfect, leaves no room for error (the 0)
  gm.compare(image1, image2, 0, function(err, isEqual) {
    callback(isEqual);
  });
}

module.exports = {
  writeImageToFile: writeImageToFile,
  compareImages: compareImages
};
