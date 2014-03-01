/* jshint node: true */
/* global require, console, module */

'use strict';

var webdriver = require('selenium-webdriver');

function _open(browserName, server, next) {
  // haven't tested on ie. Safari is buggy (can't receive sent keys correctly)
  // http://stackoverflow.com/questions/18389419/selenium-webdriverjs-cannot-
  // build-webdriver-for-chrome
  if (browserName === null || typeof browserName === 'undefined') browserName = 'firefox';
  browserName = browserName.toLowerCase();

  var browser;
  var serverUrl = (typeof server !== 'undefined')? server : null;

  if (browserName === 'firefox') {
    browser = webdriver.Capabilities.firefox();
    serverUrl = server || 'http://localhost:4444/wd/hub';
  } else if (browserName === 'chrome') {
    browser = webdriver.Capabilities.chrome();
    serverUrl = server || 'http://localhost:9515';
  } else {
    return next('Unsupported browser.');
  }

  console.log('=======================');
  console.log('Webdriver Created with:');
  console.log('Browser: ', browserName);
  console.log('Server:  ', serverUrl);
  console.log('=======================');

  var driver = new webdriver.Builder()
    .usingServer(serverUrl)
    .withCapabilities(browser)
    .build();

  if (driver === null) return next('Unsupported browser.');

  next(null, driver);
}

function open(browserName, server, next) {
  _open(browserName, server, next);
}

// the sole purpose of this driver is to steal the focus away from the main
// one; without the focus, the main window's form input won't get the highlight
// hue; this behavior is more desirable than to have inconsistencies in
// highlighting due to the user manually focusing/unfocusing the window at the
// beginning
function openDummy(browserName, server, next) {
  _open(browserName, server, function(err, driver) {
    if (err) return next(err);

    // make this as unobstructive as possible
    driver.manage().window().setSize(1, 1);
    driver.manage().window().setPosition(9999, 9999);
    next(null, driver);
  });
}

function goToUrl(driver, url, windowWidth, windowHeight, next) {
  driver.manage().window()
    .setSize(windowWidth, windowHeight)
    .then(function() {
      driver.get(url);
    })
    .then(next);
}

function quit(driver, next) {
  driver.quit().then(next);
}

module.exports = {
  open: open,
  openDummy: openDummy,
  goToUrl: goToUrl,
  quit: quit
};
