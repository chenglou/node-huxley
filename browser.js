var fs = require('fs');
var webdriver = require('selenium-webdriver');

function getNewDriver() {
  driver = new webdriver.Builder()
    .usingServer('http://localhost:4444/wd/hub')
    // TODO: browser choice
    .withCapabilities(webdriver.Capabilities.firefox())
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

// TODO: shorter name
function getRecordedEvents(driver, done) {
  driver
    .executeScript('return window._getHuxleyEvents();')
    .then(done);
}

module.exports = {
  getNewDriver: getNewDriver,
  openToUrl: openToUrl,
  quit: quit,
  getRecordedEvents: getRecordedEvents
};
