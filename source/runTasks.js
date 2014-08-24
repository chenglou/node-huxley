'use strict';

var Promise = require('bluebird');

var browser = require('./browser/browser');

function runTasks(fn, opts, tasks, paths) {
  var deepEmpty = tasks.every(function(task) {
    return task.length === 0;
  });

  if (deepEmpty) {
    var msg = opts.taskName == null ?
      'Designated Huxleyfile(s) empty.' :
      'No task named "' + opts.taskName + '" found.';
    return Promise.reject(new Error(msg));
  }

  var driver;
  if (opts.injectedDriver == null) {
    // why opening the browser (the single slowest operation) is
    // synchronous, I cannot understand. Do it as late as possible
    driver = browser.open(opts.browserName, opts.serverUrl);
  } else {
    // this is already opened when the third-party called `.build()` on their
    // driver to build it
    driver = opts.injectedDriver;
  }

  // gracefully exit if process' killed impromptu
  process.on('SIGINT', function() {
    browser.quit(driver);
  });

  // opts.browserName is used to create the driver; since injectedDriver
  // bypasses our own `browser.open()` driver creation, `opts.browserName`
  // potentially doesn't reflect the actual (injected) driver's browser
  // name. See same note in `browser.getBrowserName`
  return browser
    .getBrowserName(driver)
    .then(function(browserName) {
      return Promise.each(tasks, function(content, i) {
        return fn(driver, content, paths[i], browserName);
      });
    })
    .finally(function() {
      if (driver) {
        return browser.quit(driver);
      }
    });
}

module.exports = runTasks;
