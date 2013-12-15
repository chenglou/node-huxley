'use strict';

var fs = require('fs');
var webdriver = require('selenium-webdriver');

// the sole purpose of this driver is to steal the focus away from the main
// one; without the focus, the main window's form input won't get the highlight
// hue; this behavior is more desirable than to have inconsistencies in
// highlighting due to the user manually focusing/unfocusing the window at the
// beginning
var dummyDriver;

function getNewDriver(browserName) {
  var browser;
  var serverUrl;
  var driver;
  // haven't tested on ie. Safari is buggy (can't receive sent keys correctly)
  // http://stackoverflow.com/questions/18389419/selenium-webdriverjs-cannot-
  // build-webdriver-for-chrome
  if (browserName == null) browserName = 'firefox';
  browserName = browserName.toLowerCase();

  if (browserName === 'firefox') {
    browser = webdriver.Capabilities.firefox();
    serverUrl = 'http://localhost:4444/wd/hub';
  } else if (browserName === 'chrome') {
    browser = webdriver.Capabilities.chrome();
    serverUrl = 'http://localhost:9515';
  } else {
    return;
  }

  driver = new webdriver.Builder()
    .usingServer(serverUrl)
    .withCapabilities(browser)
    .build();

  dummyDriver = new webdriver.Builder()
    .usingServer(serverUrl)
    .withCapabilities(browser)
    .build();

  // see comment above. Make this as unobstructive as possible
  dummyDriver.manage().window().setSize(1, 1);
  dummyDriver.manage().window().setPosition(9999, 9999);

  return driver;
}

function openToUrl(driver, url, windowWidth, windowHeight, done) {
  driver.manage().window()
    .setSize(windowWidth, windowHeight)
    .then(function() {
      driver.get(url);
    })
    .then(done);
}

function quit(driver, done) {
  dummyDriver
    .quit()
    .then(function() {
      driver.quit();
    })
    .then(done);
}

module.exports = {
  getNewDriver: getNewDriver,
  openToUrl: openToUrl,
  quit: quit
};
