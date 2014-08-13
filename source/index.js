'use strict';

var defaultWorkflow = require('./defaultWorkflow');
var getDefaultOpts = require('./getDefaultOpts');
var forEachHuxleyfile = require('./forEachHuxleyfile');
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
  // injectDriver: browser.injectDriver,
  defaultWorkflow: wrap(defaultWorkflow),
  recordTasks: wrap(forEachHuxleyfile.bind(null, recordTasks)),
  compareScreenshots: wrap(forEachHuxleyfile.bind(null, compareScreenshots)),
  writeScreenshots: wrap(forEachHuxleyfile.bind(null, writeScreenshots)),
};
