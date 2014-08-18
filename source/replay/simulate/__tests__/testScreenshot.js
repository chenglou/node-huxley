'use strict';

var expect = require('expect');

var browser = require('../../../browser/browser');
var fs = require('fs');
var outputDiffP = require('../../../promisified/outputDiffP');
var path = require('path');
var screenshot = require('../screenshot');

// this util is used by click/scroll/keypress/etc. We  conveniently test
// `screenshot()` while we're at it. So no screenshot-test needed for now
function testScreenshot(driver, browserName, url, w, h, pngName, fn) {
  return browser.goToUrl(driver, url)
   .then(function() {
      return browser.setSize(driver, browserName, w, h);
    })
    .then(function() {
      return fn();
    })
    .then(function() {
      return screenshot(driver, w, h, browserName);
    })
    .then(function(img) {
      var expected = fs.readFileSync(path.join(
        __dirname,
        'fixture/' + pngName + '-' + browserName + '.png'
      ));
      var actual = new Buffer(img, 'base64');
      // fs.writeFileSync(__dirname + Math.random() + '.png', actual);

      return outputDiffP(expected, actual);
    })
    .spread(function(diffMetric) {
      expect(diffMetric).toBe(0);
    })
    .finally(function() {
      browser.quit(driver);
    });
}

module.exports = testScreenshot;
