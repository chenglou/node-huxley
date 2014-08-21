'use strict';

var Promise = require('bluebird');

var loadRunnables = require('./fileOps/loadRunnables');
var runTasks = require('./runTasks');

function runRunnableTasks(fn, opts) {
  return loadRunnables(opts.globs, opts.taskName)
    .spread(function(runnableTasks, runnablePaths) {
      return runTasks(fn, opts, runnableTasks, runnablePaths);
    });
}

module.exports = runRunnableTasks;
