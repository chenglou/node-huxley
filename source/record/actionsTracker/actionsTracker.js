'use strict';

var Promise = require('bluebird');

var browser = require('../../browser/browser');
var fsP = require('../../fileOps/fsP');
var path = require('path');

function injectScript(driver) {
  return fsP
    .readFileAsync(
      path.join(__dirname, './injectedScript.js'),
      {encoding: 'utf8'}
    )
    .then(function(script) {
      return browser.executeScript(driver, script);
    });
}

function getActions(driver) {
  return browser.executeScript(driver, 'return window._getHuxleyEvents();');
}

module.exports = {
  injectScript: injectScript,
  getActions: getActions,
};
