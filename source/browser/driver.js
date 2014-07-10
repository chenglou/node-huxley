'use strict';

var webdriver = require('selenium-webdriver');

var consts = require('../constants');
var _injectedDriver;

function _open(browserName, serverUrl, next) {
  // haven't tested on ie. Safari is buggy (can't receive sent keys correctly)
  // http://stackoverflow.com/questions/18389419/selenium-webdriverjs-cannot-
  // build-webdriver-for-chrome
  var browser;
  browserName = browserName.toLowerCase();

  if (browserName === 'firefox') {
    browser = webdriver.Capabilities.firefox();
    serverUrl = serverUrl || consts.DEFAULT_SERVER_URL_FIREFOX;
  } else if (browserName === 'chrome') {
    browser = webdriver.Capabilities.chrome();
    serverUrl = serverUrl || consts.DEFAULT_SERVER_URL_CHROME;
  } else {
    return next('Unsupported browser.');
  }

  var driver = new webdriver.Builder()
    .usingServer(serverUrl)
    .withCapabilities(browser)
    .build();

  if (driver == null) return next('Unsupported browser driver.');

  next(null, driver);
}

function open(browserName, serverUrl, next) {
  if (_injectedDriver) {
    console.log('Using injected driver.');
    next(null, _injectedDriver());
    return;
  }

  console.log('\n%s opening.', browserName);
  if (serverUrl) {
    // conveniently hide the server detail if not passed as cmd line param by
    // the user
    console.log('(driver server url: %s)', serverUrl);
  }

  _open(browserName, serverUrl, next);
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

function injectDriver(driver) {
  _injectedDriver = driver;
}

module.exports = {
  injectDriver: injectDriver,
  open: open,
  goToUrl: goToUrl,
  quit: quit
};
