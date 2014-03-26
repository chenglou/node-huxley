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
    next(null, _injectedDriver);
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

// the sole purpose of this driver is to steal the focus away from the main
// one; without the focus, the main window's form input won't get the highlight
// hue; this behavior is more desirable than to have inconsistencies in
// highlighting due to the user manually focusing/unfocusing the window at the
// beginning
function openDummy(browserName, serverUrl, next) {
  _open(browserName, serverUrl, function(err, driver) {
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

function injectDriver(driver) {
  _injectedDriver = driver;
}

module.exports = {
  injectDriver: injectDriver,
  open: open,
  openDummy: openDummy,
  goToUrl: goToUrl,
  quit: quit
};
