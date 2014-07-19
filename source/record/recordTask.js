'use strict';

var Promise = require('bluebird');

var browser = require('../browser/browser');
var consts = require('../constants');
var fsP = require('../fileOps/fsP');
var path = require('path');
var processActions = require('./processActions');
var recordCLIUntilQuit = require('./recordCLIUntilQuit');

function injectTrackingScript(driver) {
  fsP
    .readFileAsync(
      path.join(__dirname, './actionsTracker.js'),
      {encoding: 'utf8'}
    )
    .then(function(script) {
      return browser.executeScript(driver, script);
    });
}

function getTrackedActions(driver) {
  return browser.executeScript(driver, 'return window._getHuxleyEvents();');
}

function displayPrompt() {
  console.log('Begin record');
  console.log(
    'Type q to quit, l for taking a screenshot and marking a live playback ' +
    'point til next screenshot, and anything else to take a normal screenshot.'
  );
}

function recordTask(driver, task) {
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
      return injectTrackingScript(driver);
    })
    .then(function() {
      return browser.setSize(driver, w, h);
    })
    .then(function() {
      displayPrompt();
      return recordCLIUntilQuit();
    })
    .then(function(screenshotActions) {
      return [getTrackedActions(driver), screenshotActions];
    })
    .spread(processActions);
}

module.exports = recordTask;
