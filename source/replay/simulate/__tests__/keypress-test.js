'use strict';

var expect = require('expect');

var browser;
var keypress;
var fs;
var outputDiffP;
var path;
var screenshot;

xdescribe('keypress', function() {
  beforeEach(function() {
    browser = require('../../../browser/browser');
    keypress = require('../keypress');
    fs = require('fs');
    outputDiffP = require('../../../promisified/outputDiffP');
    path = require('path');
    screenshot = require('../screenshot');
  });

  this.timeout(5000);

  it('key presses', function(done) {
    var driver = browser.open('firefox');
    var url = 'file://' + __dirname + '/fixture/keypress.html';
    var w = 300;
    var h = 200;

    browser.goToUrl(driver, url)
      .then(function() {
        return browser.setSize(driver, w, h);
      })
      .then(function() {
        return keypress(driver, 'a');
      })
      .then(function() {
        return keypress(driver, 'b');
      })
      .then(function() {
        return screenshot(driver, w, h, 'firefox');
      })
      .then(function(img) {
        var expected =
          fs.readFileSync(path.join(__dirname, 'fixture/keypress.png'));
        var actual = new Buffer(img, 'base64');
        return outputDiffP(expected, actual);
      })
      .then(function(args) {
        var diffMetric = args[0];
        expect(diffMetric).toBe(0);
      })
      .then(done.bind(null, null), done)
      .finally(function() {
        browser.quit(driver);
      });
  });
});
