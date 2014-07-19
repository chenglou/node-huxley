var browser = require('../../browser/browser');

function simulateScroll(driver, posX, posY) {
  return browser
    .executeScript(driver, 'window.scrollTo(' + posX + ',' + posY + ')');
}

module.exports = simulateScroll;
