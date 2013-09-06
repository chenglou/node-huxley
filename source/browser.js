'use strict';

var fs = require('fs');
var webdriver = require('selenium-webdriver');

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
  driver
    .quit()
    .then(done);
}

module.exports = {
  getNewDriver: getNewDriver,
  openToUrl: openToUrl,
  quit: quit
};
