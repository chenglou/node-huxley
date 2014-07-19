var Promise = require('bluebird');

var browser = require('../../browser/browser');
var specialKeys = require('selenium-webdriver').Key;

function simulateKeypress(driver, key) {
  return browser
    .executeScript(driver, 'return document.activeElement;')
    .then(function(activeElement) {
      if (!activeElement) {
        return Promise.resolve();
      }

      // refer to `actionsTracker.js`. The special keys are the arrow keys,
      // stored like 'ARROW_LEFT', By chance, the webdriver's `Key` object
      // stores these keys
      if (key.length > 1) {
        key = specialKeys[key];
      }

      return activeElement.sendKeys(key);
    });
}

module.exports = simulateKeypress;
