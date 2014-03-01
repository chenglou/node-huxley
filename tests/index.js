'use strict';

var colors = require('colors');
var exec = require('child_process').exec;
var glob = require('glob');
var grunt = require('grunt');
var path = require('path');

var huxley = require('../');


// TODO: start selenium and server

// since this script's loaded by grunt, this is the only good way to get the
// relative path to here
var currentFolder = path.relative(process.cwd(), __dirname);

function _testPasses(next) {
  var browserName = 'firefox';
  var server = 'http://localhost:4444/wd/hub';
  var paths = [path.join(currentFolder, 'passes/**')];
  huxley.playbackTasksAndCompareScreenshots(browserName, server, paths, function(err) {
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

function _testFails(next) {
  var browserName = 'firefox';
  var server = 'http://localhost:4444/wd/hub';
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
  _runFailTest(browserName, server, [failTestsPaths[currentTestIndex]], function nextTest(successful) {
    if (successful === false) return next(false);
    if (currentTestIndex === failTestsPaths.length - 1) return next();

    _runFailTest(browserName, server, [failTestsPaths[++currentTestIndex]], nextTest);
  });
}

function wrapTestsForGrunt(testMethod, errMessage) {
  return function() {
    var next = this.async();

    testMethod(function(successful) {
      if (successful === false) {
        grunt.log.error(errMessage);
        return next(false);
      }

      next();
    });
  };
}

module.exports = {
  testPasses: wrapTestsForGrunt(
    _testPasses, 'Some tests didn\'t pass.'
  ),
  testFails: wrapTestsForGrunt(
    _testFails, 'Some tests that should have failed didn\'t'
  )
};
