'use strict';

var Promise = require('bluebird');

var expect = require('expect');

var browser;
var scroll;
var testScreenshot;

describe('scroll', function() {
  beforeEach(function() {
    browser = require('../../../browser/browser');
    scroll = require('../scroll');
    testScreenshot = require('./testScreenshot');
  });

  this.timeout(8000);

  it('scrolls', function(done) {
    var url = 'file://' + __dirname + '/fixture/scroll.html';

    Promise.each(['firefox', 'chrome'], function(browserName) {
      var driver = browser.open(browserName);
      var fn = function() {
        return scroll(driver, 150, 200);
      };
      return testScreenshot(driver, browserName, url, 450, 250, 'scroll', fn);
    })
    .then(done.bind(null, null), done);
  });
});
