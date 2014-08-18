'use strict';

var Promise = require('bluebird');

var browser = require('./browser/browser');
var loadRunnables = require('./fileOps/loadRunnables');

function forEachHuxleyfile(fn, opts) {
  var driver;
  var runnableTasks;
  var runnablePaths;

  return loadRunnables(opts.globs, opts.taskName)
    .spread(function(a, b) {
      runnableTasks = a;
      runnablePaths = b;

      var deepEmpty = runnableTasks.every(function(task) {
        return task.length === 0;
      });
      if (deepEmpty) {
        var msg = opts.taskName == null ?
          'Designated Huxleyfile(s) empty' :
          'No task named "' + opts.taskName + '" found.';
        return Promise.reject(new Error(msg));
      }

      if (opts.injectedDriver == null) {
        // why opening the browser (the single slowest operation) is
        // synchronous, I cannot understand. Do it as late as possible
        driver = browser.open(opts.browserName, opts.serverUrl);
        return [driver, opts.browserName];
      }

      // opts.browserName is used to create the driver; since injectedDriver
      // bypasses our own `browser.open()` driver creation, `opts.browserName`
      // potentially doesn't reflect the actual (injected) driver's browser
      // name.
      return opts.injectedDriver.getCapabilities()
        .then(function(whatIsThis) {
          // damn it selenium, where's the js api docs
          return [opts.injectedDriver, whatIsThis.caps_.browserName];
        });
    })
    .spread(function(driver, browserName) {
      return Promise.each(runnableTasks, function(content, i) {
        return fn(driver, content, runnablePaths[i], browserName);
      });
    })
    .finally(function() {
      if (driver) {
        return browser.quit(driver);
      }
    });
}

module.exports = forEachHuxleyfile;
