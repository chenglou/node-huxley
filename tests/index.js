'use strict';

var colors = require('colors');
var glob = require('glob');
var grunt = require('grunt');
var path = require('path');

var consts = require('../source/constants');
var huxley = require('../');

// since this script's loaded by grunt, this is the only good way to get the
// relative path to here
var currentFolder = path.relative(process.cwd(), __dirname);

function _testPasses(browserName, serverUrl, next) {
  var paths = [path.join(currentFolder, 'passes/**')];
  huxley.playbackTasksAndCompareScreenshots(browserName, serverUrl, paths, function(err) {
    if (err) {
      grunt.log.error(err);
      return next(false);
    }

    next();
  });
}

function _runFailTest(browserName, server, globs, next) {
  huxley.playbackTasksAndCompareScreenshots(browserName, server, globs, function(err) {
    // if the callback's called this mean nothing went wrong. But we don't
    // want it to be successful!
    if (err) {
      console.log(err);
      return next();
    }

    next(false);
  });
}

function _testFails(browserName, serverUrl, next) {
  var failTestsPaths = glob
    .sync(path.join(currentFolder, 'fails/**/Huxleyfile.json'))
    .map(function(path) {
      // huxley appends the 'Huxleyfile.json' part itself; no need to include it
      // here. Also,
      return path
        .slice(0, path.lastIndexOf('/') + 1)
        .replace(/ /g, '\\ ');
    });

  var currentTestIndex = 0;
  _runFailTest(browserName, serverUrl, [failTestsPaths[currentTestIndex]], function nextTest(successful) {
    if (successful === false) return next(false);
    if (currentTestIndex === failTestsPaths.length - 1) return next();

    _runFailTest(browserName, serverUrl, [failTestsPaths[++currentTestIndex]], nextTest);
  });
}

function _testInjectedDriver(browserName, serverUrl, next) {
  var webdriver = require('selenium-webdriver');
  var browser = webdriver.Capabilities.firefox();
  var driver = new webdriver.Builder()
    .usingServer(serverUrl)
    .withCapabilities(browser)
    .build();

  huxley.injectDriver(function() {
    return driver;
  });

  _testPasses(browserName, serverUrl, function(err) {
    if (err) return next(false);

    next();
    // Erase the injected driver. Just for sure, that we didn't broke next test.
    huxley.injectDriver(null);
  });
}

function wrapTestsForGrunt(testMethod, errMessage) {
  return function() {
    var next = this.async();

    testMethod('firefox', consts.DEFAULT_SERVER_URL_FIREFOX, function(successful) {
      if (successful === false) {
        grunt.log.error(errMessage);
        return next(false);
      }
      return next();

      // testMethod('chrome', consts.DEFAULT_SERVER_URL_CHROME, function(successful) {
      //   if (successful === false) {
      //     grunt.log.error(errMessage);
      //     return next(false);
      //   }

      //   next();
      // });
    });
  };
}

module.exports = {
  testPasses: wrapTestsForGrunt(_testPasses, 'Some tests didn\'t pass.'),
  testFails: wrapTestsForGrunt(
    _testFails, 'Some tests that should have failed didn\'t.'
  ),
  testInjectedDriver: wrapTestsForGrunt(
    _testInjectedDriver, 'Injected driver does not work.'
  )
};
