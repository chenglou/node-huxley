var fs = require('fs');
var webdriver = require('selenium-webdriver');

function buildAndReturnNewDriver() {
  driver = new webdriver.Builder()
    .usingServer('http://localhost:4444/wd/hub')
    // TODO: browser choice
    .withCapabilities(webdriver.Capabilities.firefox())
    .build();

  return driver;
}

function openToUrl(driver, url, windowWidth, windowHeight, callback) {
  // TODO: test if need then()
  driver.manage().window().setSize(windowWidth, windowHeight);
  driver.get(url).then(callback);
}

// TODO: maybe not needed
function refresh(driver, callback) {
  // TODO: this. Callback?
  driver.navigate()
    .refresh()
    .then(callback);
}

function quit(driver, callback) {
  driver
    .quit()
    .then(callback);
}

// TODO: shorter name
function getBrowserEvents(driver, callback) {
  var events = driver
    .executeScript('return window._getHuxleyEvents();')
    .then(callback);
}

module.exports = {
  buildAndReturnNewDriver: buildAndReturnNewDriver,
  openToUrl: openToUrl,
  refresh: refresh,
  quit: quit,
  getBrowserEvents: getBrowserEvents
};


// TODO: remove

// openToUrl('localhost:8000', 1000, 1000, function(driver) {
//   setTimeout(function() {
//     refresh(driver, function() {
//       console.log('refreshed');
//       injectEventsScript(driver, function() {
//         console.log('events injected');
//         setTimeout(function() {
//           getBrowserEvents(driver, function(recordedBrowserEvents) {
//             console.log(recordedBrowserEvents);
//           });
//         }, 1000);
//       });
//     });
//   }, 1000);
// });
