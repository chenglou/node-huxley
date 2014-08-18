'use strict';

var Promise = require('bluebird');

var actionsTracker = require('./actionsTracker/actionsTracker');
var browser = require('../browser/browser');
var consts = require('../constants');
var processActions = require('./processActions');
var recordCLIUntilQuit = require('./recordCLIUntilQuit');

function displayPrompt(taskName) {
  console.log('Begin record "%s"', taskName);
  console.log(
    'Type q to quit, l for taking a screenshot and marking a live playback ' +
    'point til next screenshot, and anything else to take a normal screenshot.'
  );
}

function recordTask(driver, browserName, task) {
  var w;
  var h;
  if (!task.screenSize) {
    w = consts.DEFAULT_SCREEN_SIZE[0];
    h = consts.DEFAULT_SCREEN_SIZE[1];
  } else {
    w = task.screenSize[0];
    h = task.screenSize[1];
  }
  return browser
    .goToUrl(driver, task.url)
    .then(function() {
      return actionsTracker.injectScript(driver);
    })
    .then(function() {
      return browser.setSize(driver, browserName, w, h);
    })
    .then(function() {
      displayPrompt(task.name);
      return recordCLIUntilQuit();
    })
    .then(function(screenshotActions) {
      return [actionsTracker.getActions(driver), screenshotActions];
    })
    .spread(processActions);
}

module.exports = recordTask;
