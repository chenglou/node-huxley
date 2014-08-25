'use strict';

var Promise = require('bluebird');

var expect = require('expect');

var browser;
var keypress;
var testScreenshot;

describe('keypress', function() {
  beforeEach(function() {
    browser = require('../../../browser/browser');
    keypress = require('../keypress');
    testScreenshot = require('./testScreenshot');
  });

  this.timeout(5000);

  it('presses', function(done) {
    var url = 'file://' + __dirname + '/fixture/keypress.html';

    Promise.each(['firefox', 'chrome'], function(browserName) {
      var driver = browser.open(browserName);
      var fn = function() {
        return keypress(driver, 'a')
          .then(function() {
            return keypress(driver, 'b');
          });
      };
      return testScreenshot(driver, browserName, url, 450, 250, 'keypress', fn);
    })
    .then(done.bind(null, null), done);
  });
});
