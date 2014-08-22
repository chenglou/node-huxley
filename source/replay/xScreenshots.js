'use strict';

var Promise = require('bluebird');

var consts = require('../constants');
var replay = require('./replay');
var loadJSON = require('../fileOps/utils/loadJSON');
var path = require('path');

// where x is one of (compare|write)
function xScreenshots(compare, driver, JSONContent, HuxleyfileContainerPath, browserName) {
  return Promise.each(JSONContent, function(task) {
    var p = path.join(
      HuxleyfileContainerPath,
      consts.HUXLEY_FOLDER_NAME,
      task.name + consts.RECORD_FILE_SUFFIX
    );
    return loadJSON(p)
      .then(function(actions) {
        return replay(compare, driver, task, actions, browserName, HuxleyfileContainerPath);
      });
  });
}

module.exports = xScreenshots;
