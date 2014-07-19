'use strict';

var forEachHuxleyfile = require('./forEachHuxleyfile');
var compareScreenshots = require('./replay/compareScreenshots');
var recordTasks = require('./record/recordTasks');
var writeScreenshots = require('./replay/writeScreenshots');

module.exports = {
  // injectDriver: browser.injectDriver,
  recordTasks: forEachHuxleyfile.bind(null, recordTasks),
  compareScreenshots: forEachHuxleyfile.bind(null, compareScreenshots),
  writeScreenshots: forEachHuxleyfile.bind(null, writeScreenshots),
};
