var Promise = require('bluebird');

var browser = require('../../browser/browser');
var cropP = require('../../promisified/cropP');

// I want to unfocus the component before taking a screenshot (the hue screws up
// stuff), but focus might trigger other interface changes

function simulateScreenshot(driver, w, h, browserName) {
  var obtainedScrollPos;

  return browser
    .executeScript(
      driver,
      'return [window.scrollX, window.scrollY, document.body.scrollWidth, document.body.scrollHeight];'
    )
    .then(function(obtainedScrollPos1) {
      obtainedScrollPos = obtainedScrollPos1;
      // we'd return [browser.takeScreenshot(driver), obtainedScrollPos] here,
      // but remember that executeScript returns a selenium flavor promise (the)
      // only one that's not wrappable with bluebird, see browser.js
      return browser.takeScreenshot(driver);
    })
    .then(function(rawImageString) {
      var left = Math.min(obtainedScrollPos[0], obtainedScrollPos[2] - w);
      var top = Math.min(obtainedScrollPos[1], obtainedScrollPos[3] - h);

      var config = {
        left: left < 0 ? 0 : left,
        top: top < 0 ? 0 : top,
        width: w,
        height: h
      };

      if (browserName === 'chrome') {
        // chrome already takes partial ss. Browser size is adjusted correctly
        // except for weight
        config = {
          left: 0,
          top: 0,
          width: w,
          height: 99999,
        };
      }
      var buf = new Buffer(rawImageString, 'base64');

      return cropP(buf, config);
    });
}

module.exports = simulateScreenshot;
