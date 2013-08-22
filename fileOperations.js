var mkdirp = require('mkdirp');
var fs = require('fs');

function readHuxleyFile(path, callback) {
  try {
    var huxleyFile = require(path);
    callback(huxleyFile);
  } catch (e) {
    console.error('no Huxleyfile found');
  }
}

function createTaskFolder(path, callback) {
  mkdirp(path, function(err) {
    if (err)
      console.error(err.message);
    else
      callback();
  });
}

function saveJSON(path, jsonData, callback) {
  fs.writeFile(path, JSON.stringify(jsonData), function(err) {
    if (err)
      console.error(err);
    else
      callback();
  });
}

module.exports = {
  readHuxleyFile: readHuxleyFile,
  createTaskFolder: createTaskFolder,
  saveRecordedEventsToJSON: saveRecordedEventsToJSON
};
