'use strict';

var defaultWorkflow = require('./defaultWorkflow/defaultWorkflow');
var getDefaultOpts = require('./getDefaultOpts');
var runRunnableTasks = require('./runRunnableTasks');
var compareScreenshots = require('./replay/compareScreenshots');
var recordTasks = require('./record/recordTasks');
var writeScreenshots = require('./replay/writeScreenshots');

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
