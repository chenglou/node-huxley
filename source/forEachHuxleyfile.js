'use strict';

var Promise = require('bluebird');

var browser = require('./browser/browser');
var loadRunnables = require('./fileOps/loadRunnables');

function forEachHuxleyfile(fn, opts) {
  var driver;

  return loadRunnables(opts.globs, opts.taskName)
    .spread(function(runnableTasks, runnablePaths) {
      var deepEmpty = runnableTasks.every(function(task) {
        return task.length === 0;
      });
      if (deepEmpty) {
        var msg = opts.taskName == null ?
          'Designated Huxleyfile(s) empty' :
          'No task named "' + opts.taskName + '" found.';
        return Promise.reject(new Error(msg));
      }

      // why opening the browser (the single slowest operation) is synchronous,
      // I cannot understand. Do it as late as possible if the above stuff
      // throws/is rejected
      driver = browser.open(opts.browserName, opts.serverUrl);

      return Promise.each(runnableTasks, function(content, i) {
        return fn(driver, content, runnablePaths[i], opts.browserName);
      });
    })
    .finally(function() {
      if (driver) {
        return browser.quit(driver);
      }
    });
}

module.exports = forEachHuxleyfile;
