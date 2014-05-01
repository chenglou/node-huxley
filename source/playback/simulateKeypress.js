var specialKeys = require('selenium-webdriver').Key;

function simulateKeypress(driver, key, next) {
  driver
    .executeScript('return document.activeElement;')
    .then(function(activeElement) {
      if (!activeElement) return next();

      // refer to `actionsTracker.js`. The special keys are the arrow keys,
      // stored like 'ARROW_LEFT', By chance, the webdriver's `Key` object
      // stores these keys
      if (key.length > 1) key = specialKeys[key];
      activeElement
        .sendKeys(key)
        .then(next);
    });
}

module.exports = simulateKeypress;
