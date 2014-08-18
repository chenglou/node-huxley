'use strict';

var Promise = require('bluebird');

var webdriver = require('selenium-webdriver');

var consts = require('../constants');

function normalizeUrl(url) {
  if (!/^\w+?:\/\//.test(url)) {
    url = 'http://' + url;
  }
  return url;
}

function open(browserName, serverUrl) {
  // haven't tested on ie. Safari is buggy (can't receive sent keys correctly)
  // http://stackoverflow.com/questions/18389419/selenium-webdriverjs-cannot-
  // build-webdriver-for-chrome
  if (browserName !== 'firefox' && browserName !== 'chrome') {
    return new Error('Unsupported browser.');
  }

  var browser;
  if (browserName === 'firefox') {
    browser = webdriver.Capabilities.firefox();
    serverUrl = serverUrl || consts.DEFAULT_SERVER_URL_FIREFOX;
  } else {
    // https://code.google.com/p/chromedriver/issues/detail?id=799
    // need to pass this arg, or else the chrome window displays an error
    // banner message, which screws up viewport dimensions
    browser = webdriver.Capabilities.chrome().set('chromeOptions', {
      args: ['--test-type'],
    });
    serverUrl = serverUrl || consts.DEFAULT_SERVER_URL_CHROME;
  }

  var driver = new webdriver.Builder()
    .usingServer(serverUrl)
    .withCapabilities(browser)
    .build();

  if (driver == null) {
    return new Error('Unsupported browser driver.');
  }

  return driver;
}

// selenium amuses itself by implementing promises themselves, and very poorly.
// Beside the basic `then`, there isn't much else. Here I wrap their pseudo-
// promises with an actually good implementation, so that things like `finally`
// and `all` work

// `bluebird.promisifyAll` won't work here for various reasons, e.g. the
// `driver.manage().moreBla` right below

// (w, h) is the size of the browser content dimensions, which is what we want
// most of the times. Selenium's `setSize`, however, asks for whole browser size
// including browser chrome height. Normalize all here.

var browserChrome = {
  'chrome': [0, 72],
  'firefox': [0, 79],
};

function setSize(driver, browserName, w, h) {
  var displayW = w + browserChrome[browserName][0];
  var displayH = h + browserChrome[browserName][1];

  var prom = new Promise(function(resolve, reject) {
    driver.manage().window().setSize(displayW, displayH).then(resolve, reject);
  });
  return prom;
}

function takeScreenshot(driver) {
  var prom = new Promise(function(resolve, reject) {
    driver.takeScreenshot().then(resolve, reject);
  });
  return prom;
}

function goToUrl(driver, url) {
  // selenium throws an obscure message if you don't append the protocol to your
  // url (https://code.google.com/p/selenium/issues/detail?id=6988). Default to
  // http
  var prom = new Promise(function(resolve, reject) {
    driver.get(normalizeUrl(url))
      .then(function() {
        // wow selenium
        // right now the url bar has focus. So if you try to programmatically
        // focus an html node it'd fail. Bring the focus back
        return executeScript(driver, 'window.focus();');
      })
      .then(resolve, reject);
  });
  return prom;
}

function executeScript(driver, script) {
  // this is the only one we don't chain here. If you do, you get this:
  // https://github.com/petkaantonov/bluebird/wiki/Error:-circular-promise-resolution-chain
  // executeScript has to return the return of your js script. This screws
  // things up since all the other bluebird wrappers up and below return selves

  // this can pollute the whole system. Fortunately, in every case where
  // executeScript is used, we never return the same chained promise. So further
  // down the line we still get bluebird's clean promises (which is the whole)
  // point of these wrapping
  return driver.executeScript(script);
}

function quit(driver) {
  var prom = new Promise(function(resolve, reject) {
    driver.quit().then(resolve, reject);
  });
  return prom;
}

module.exports = {
  open: open,
  goToUrl: goToUrl,
  setSize: setSize,
  executeScript: executeScript,
  takeScreenshot: takeScreenshot,
  quit: quit
};
