'use strict';

var Promise = require('bluebird');

var browser = require('../browser/browser');
var colors = require('colors');
var actOnScreenshot = require('./actOnScreenshot');
var consts = require('../constants');
var fsP = require('../promisified/fsP');
var path = require('path');

var simulateClick = require('./simulate/click');
var simulateKeypress = require('./simulate/keypress');
var simulatePause = require('./simulate/pause');
var simulateScreenshot = require('./simulate/screenshot');
var simulateScroll = require('./simulate/scroll');

function actOnScreenshot2(buf, taskDirname, imgIndex, browserName, compare) {
  var destPath = path.join(taskDirname, browserName + '-' + imgIndex + '.png');
  if (compare) {
    var diffPath = path.join(taskDirname, browserName + '-' + imgIndex + '-diff.png');
    return fsP
      .readFileAsync(destPath)
      .then(function(origBuf) {
        return actOnScreenshot.diff(origBuf, buf, diffPath);
      });
  }

  return actOnScreenshot.update(buf, destPath);
}

function simulateEach(driver, w, h, actions, browserName, taskDirname, compare) {
  var screenshotCount = 0;

  return Promise.each(actions, function(action) {
    switch (action.action) {
      case consts.STEP_CLICK:
        console.log('  Clicking (%s, %s)', action.x, action.y);
        return simulateClick(driver, action.x, action.y);
      case consts.STEP_KEYPRESS:
        console.log('  Typing ' + action.key);
        return simulateKeypress(driver, action.key);
      case consts.STEP_PAUSE:
        console.log('  Pause for %s ms'.grey, action.ms);
        return simulatePause(action.ms);
      case consts.STEP_SCROLL:
        console.log('  Scrolling to (%s, %s)', action.x, action.y);
        return simulateScroll(driver, action.x, action.y);
      case consts.STEP_SCREENSHOT:
        var msg = compare ? 'Comparing' : 'Taking';
        console.log('  ' + msg + ' screenshot %s', ++screenshotCount);
        return simulateScreenshot(driver, w, h, browserName)
          .then(function(buf) {
            return actOnScreenshot2(buf, taskDirname, screenshotCount, browserName, compare);
          });
      default:
        return Promise.reject(new Error('Uncognized action to reproduce.'));
    }
  });
}

function replay(compare, driver, task, actions, browserName, HuxleyfileContainerPath) {
  var w;
  var h;
  if (!task.screenSize) {
    w = consts.DEFAULT_SCREEN_SIZE[0];
    h = consts.DEFAULT_SCREEN_SIZE[1];
  } else {
    w = task.screenSize[0];
    h = task.screenSize[1];
  }

  return browser
    .goToUrl(driver, task.url)
    .then(function() {
      return browser.setSize(driver, browserName, w, h);
    })
    .then(function() {
      console.log(
        'Replaying and %s screenshots for "%s"\n',
        compare ? 'comparing' : 'writing',
        task.name
      );
      var taskDirname = path.join(
        HuxleyfileContainerPath,
        consts.HUXLEY_FOLDER_NAME,
        task.name + consts.HUXLEY_FOLDER_SUFFIX
      );
      return simulateEach(driver, w, h, actions, browserName, taskDirname, compare);
    })
    .catch(function(err) {
      // probably screenshot-related. Continue and finish other tasks nonetheless
      if (err.cause && err.cause.errno === 34 && err.cause.code === 'ENOENT') {
        console.log(err.message.red);
        console.log('You probably tried to compare screenshot against non-existant ones.');
      } else if (err.name === 'DifferentScreenshot') {
        console.log((err.message + ' ' + err.diffPath + '\n').red);
      } else if (err.message.indexOf('Images not the same dimension') > -1) {
        console.log((err.message.red));
      } else {
        // unrecognized. Throw again to have the stack trace
        throw err;
      }
    });
}

module.exports = replay;
