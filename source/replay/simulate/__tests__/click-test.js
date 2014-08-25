'use strict';

var Promise = require('bluebird');

var expect = require('expect');

var browser;
var click;
var testScreenshot;

describe('click', function() {
  beforeEach(function() {
    browser = require('../../../browser/browser');
    click = require('../click');
    testScreenshot = require('./testScreenshot');
  });

  this.timeout(5000);

  it('clicks', function(done) {
    var url = 'file://' + __dirname + '/fixture/click.html';

    Promise.each(['firefox', 'chrome'], function(browserName) {
      var driver = browser.open(browserName);
      var fn = function() {
        return click(driver, 20, 40);
      };
      return testScreenshot(driver, browserName, url, 450, 250, 'click', fn);
    })
    .then(done.bind(null, null), done);
  });
});
