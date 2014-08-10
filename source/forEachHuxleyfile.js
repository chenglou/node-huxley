'use strict';

var Promise = require('bluebird');

var browser = require('./browser/browser');
var defaultCb = require('./defaultCb');
var getHuxleyfilesPaths = require('./fileOps/getHuxleyfilesPaths');
var getRunnables = require('./getRunnables');
var loadJSON = require('./fileOps/loadJSON');
var path = require('path');

function forEachHuxleyfileRaw(fn, opts, cb) {
  var driver;

  return getHuxleyfilesPaths(opts.globs)
    .then(function(ps) {
      if (ps.length === 0) {
        return Promise.reject(new Error('No Huxleyfile found.'));
      }
      var dirs = ps.map(path.dirname);
      return [Promise.map(ps, loadJSON).all(), dirs];
    })
    .spread(function(JSONs, ps) {
      var runnables = getRunnables(JSONs, ps, opts.taskName);
      var runnableTasks = runnables[0];
      var runnablePaths = runnables[1];

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
    })
    .then(cb.bind(null, null), cb);
}

function forEachHuxleyfile(fn, opts, cb) {
  var newOpts = {};

  if (opts.globs && opts.globs.length !== 0) {
    newOpts.globs = opts.globs;
  } else {
    newOpts.globs = [path.join(process.cwd(), '**')];
  }
  newOpts.browserName = (opts.browserName && opts.browserName.toLowerCase()) || 'firefox';
  newOpts.serverUrl = opts.serverUrl;
  newOpts.taskName = opts.taskName;

  cb = cb || defaultCb;

  return forEachHuxleyfileRaw(fn, newOpts, cb);
}

module.exports = forEachHuxleyfile;
