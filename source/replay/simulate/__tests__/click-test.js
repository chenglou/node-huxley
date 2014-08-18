'use strict';

var expect = require('expect');

var browser;
var click;
var fs;
var outputDiffP;
var path;
var screenshot;

xdescribe('click', function() {
  beforeEach(function() {
    browser = require('../../../browser/browser');
    click = require('../click');
    fs = require('fs');
    outputDiffP = require('../../../promisified/outputDiffP');
    path = require('path');
    screenshot = require('../screenshot');
  });

  this.timeout(5000);

  it('clicks', function(done) {
    var driver = browser.open('firefox');
    var url = 'file://' + __dirname + '/fixture/click.html';
    var w = 300;
    var h = 200;

    browser.goToUrl(driver, url)
      .then(function() {
        return browser.setSize(driver, w, h);
      })
      .then(function() {
        return click(driver, 20, 40);
      })
      .then(function() {
        return screenshot(driver, w, h, 'firefox');
      })
      .then(function(img) {
        var expected =
          fs.readFileSync(path.join(__dirname, 'fixture/click.png'));
        var actual = new Buffer(img, 'base64');
        return outputDiffP(expected, actual);
      })
      .spread(function(diffMetric) {
        expect(diffMetric).toBe(0);
      })
      .then(done.bind(null, null), done)
      .finally(function() {
        browser.quit(driver);
      });
  });
});
