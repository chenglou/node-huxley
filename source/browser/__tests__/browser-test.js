'use strict';

var expect = require('expect');

var browser;
var webdriver;

describe('browser', function() {
  beforeEach(function() {
    browser = require('../browser');
    webdriver = require('selenium-webdriver');
  });

  this.timeout(8000);

  it('should refuse unrecognized browsers', function() {
    expect(browser.open('asd') instanceof Error).toBe(true);
  });

  it('should open the browser correctly', function(done) {
    var ff = browser.open('firefox');
    browser.goToUrl(ff, 'localhost:8000/')
      .then(done.bind(null, null), done)
      .finally(function() {
        return browser.quit(ff);
      });
  });

  it('should deduce the browser name correctly from the driver', function(done) {
    var br = webdriver.Capabilities.chrome();
    var driver = new webdriver.Builder()
      .usingServer('http://localhost:9515')
      .withCapabilities(br)
      .build();

      browser.getBrowserName(driver)
        .then(function(browserName) {
          expect(browserName).toBe('chrome');
          done();
        }, done)
        .finally(function() {
          return browser.quit(driver);
        });
  });
});

