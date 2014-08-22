var Promise = require('bluebird');

var consts = require('../constants');
var fsP = require('../promisified/fsP');
var path = require('path');

function filterExistingRecords(huxleyfiles, paths) {
  return Promise.map(huxleyfiles, function(tasks, i) {
    return Promise.map(tasks, function(t) {
      var recordJSONPath = path.join(
        paths[i],
        consts.HUXLEY_FOLDER_NAME,
        t.name + consts.RECORD_FILE_SUFFIX
      );
      return fsP.existsAsync(recordJSONPath);
    });
  })
  .then(function(res) {
    // res :: [[bool]]
    var t = [];
    var p = [];
    for (var i = 0; i < res.length; i++) {
      var tasks = huxleyfiles[i].filter(function(bla, j) {
        return res[i][j];
      });
      if (tasks.length > 0) {
        t.push(tasks);
        p.push(paths[i]);
      }
    }

    return [t, p];
  });
}

module.exports = filterExistingRecords;
