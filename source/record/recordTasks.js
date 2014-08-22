'use strict';

var Promise = require('bluebird');

var consts = require('../constants');
var path = require('path');
var recordTask = require('./recordTask');
var saveJSON = require('../fileOps/utils/saveJSON');

function recordTasks(driver, JSONContent, HuxleyfileContainerPath, browserName) {
  return Promise.each(JSONContent, function(task) {
    return recordTask(driver, browserName, task)
      .then(function(actions) {
        var p = path.join(
          HuxleyfileContainerPath,
          consts.HUXLEY_FOLDER_NAME,
          task.name + consts.RECORD_FILE_SUFFIX
        );
        return saveJSON(p, actions);
      });
  });
}

module.exports = recordTasks;
