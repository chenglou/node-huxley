'use strict';

var expect = require('expect');

var browser;

xdescribe('browser', function() {
  beforeEach(function() {
    browser = require('../browser');
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

  it('should throw if the browsers isn\'t opened correctly', function(done) {
    var ff = browser.open('firefox');
    browser.goToUrl(ff, 'asd://localhost:8000/')
      .then(function() {
        done(new Error('Browser should not have been opened correctly'));
      }, function() {
        done();
      })
      .finally(function() {
        return browser.quit(ff);
      });
  });
});

