'use strict';

var Promise = require('bluebird');

var consts = require('../constants');
var replay = require('./replay');
var loadJSON = require('../fileOps/loadJSON');
var path = require('path');

// where x is one of (compare|write)
function xScreenshots(driver, JSONContent, HuxleyfileContainerPath, browserName, compare) {
  return Promise.each(JSONContent, function(task) {
    var p = path.join(
      HuxleyfileContainerPath,
      consts.HUXLEY_FOLDER_NAME,
      task.name,
      consts.RECORD_FILE_NAME
    );
    return loadJSON(p)
      .then(function(actions) {
        return replay(driver, task, actions, browserName, HuxleyfileContainerPath, compare);
      });
  });
}

module.exports = xScreenshots;
