'use strict';

var defaultWorkflow = require('./source/defaultWorkflow/defaultWorkflow');
var getDefaultOpts = require('./source/getDefaultOpts');
var runRunnableTasks = require('./source/runRunnableTasks');
var compareScreenshots = require('./source/replay/compareScreenshots');
var recordTasks = require('./source/record/recordTasks');
var writeScreenshots = require('./source/replay/writeScreenshots');

function wrap(fn) {
  return function(opts) {
    opts = getDefaultOpts(opts);
    return fn(opts);
  };
}

module.exports = {
  defaultWorkflow: wrap(defaultWorkflow),
  recordTasks: wrap(runRunnableTasks.bind(null, recordTasks)),
  compareScreenshots: wrap(runRunnableTasks.bind(null, compareScreenshots)),
  writeScreenshots: wrap(runRunnableTasks.bind(null, writeScreenshots)),
};
