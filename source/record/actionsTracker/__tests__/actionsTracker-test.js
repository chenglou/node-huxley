'use strict';

var expect = require('expect');

var actionsTracker;
var browser;

xdescribe('actionsTracker', function() {
  beforeEach(function() {
    actionsTracker = require('../actionsTracker');
    browser = require('../../../browser/browser');
  });

  this.timeout(4000);

  it('should inject and retrive actions correctly', function(done) {
    var driver = browser.open('firefox');

    actionsTracker.injectScript(driver)
      .then(function() {
        return actionsTracker.getActions(driver);
      })
      .then(function(res) {
        expect(res.length).toBe(0);
      })
      .then(function() {
        var simulateKeypressScript =
          'var evt = document.createEvent("KeyboardEvent");' +
          'evt.initKeyEvent("keypress", true, true, window, 0, 0, 0, 0, 0, "e".charCodeAt(0));' +
          'document.body.dispatchEvent(evt);';
        return browser.executeScript(driver, simulateKeypressScript);
      })
      .then(function() {
        return actionsTracker.getActions(driver);
      })
      .then(function(res) {
        expect(res.length).toBe(1);
      })
      .then(done, done)
      .finally(function() {
        browser.quit(driver);
      });
  });
});

