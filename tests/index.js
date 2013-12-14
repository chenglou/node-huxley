'use strict';

var colors = require('colors');
var exec = require('child_process').exec;
var glob = require('glob');
var grunt = require('grunt');
var huxley = require('../');
var path = require('path');



// TODO: start selenium and server

// since this script's loaded by grunt, this is the only good way to get the
// relative path to here
var currentFolder = path.relative(process.cwd(), __dirname);

function _testPasses(done) {
  var browser = 'firefox';
  var paths = [currentFolder + '/passes/**'];
  huxley.playbackTasksAndCompareScrenshots(browser, paths, done);
}

function _testFails(done) {
  var browser = 'firefox';
  var failTestsPaths = glob
    .sync(currentFolder + '/fails/**/Huxleyfile.json')
    .map(function(path) {
      // huxley appends the 'Huxleyfile.json' part itself; no need to include it
      // here. Also,
      return path
        .slice(0, path.lastIndexOf('/') + 1)
        .replace(/ /g, '\\ ');
    });

  var currentTestIndex = 0;

  (function runFailTest() {
    huxley.playbackTasksAndCompareScrenshots(browser,
                                            [failTestsPaths[currentTestIndex]],
                                            function(successful) {
      // we don't want it to be successful
      if (successful !== false) return done(false);
      if (currentTestIndex === failTestsPaths.length - 1) return done();

      currentTestIndex++;
      runFailTest();
    });
  })();
}

function wrapTestsForGrunt(testMethod, errorMessage) {
  return function() {
    var done = this.async();

    testMethod(function(successful) {
      if (successful === false) {
        grunt.log.error(errorMessage);
        return done(false);
      }

      done();
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
