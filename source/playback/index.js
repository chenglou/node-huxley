'use strict';

var colors = require('colors');
var consts = require('constants');
var path = require('path');

var imageOperations = require('../imageOperations');
var consts = require('../constants');
var runtimeConfig = require('../runtimeConfig');

var simulateScreenshot = require('./simulateScreenshot');
var simulateKeypress = require('./simulateKeypress');
var simulateClick = require('./simulateClick');
var simulateScroll = require('./simulateScroll');

function playback(playbackInfo, next) {
  var currentEventIndex = 0;
  var screenshotIndex = 1;

  var browserName = runtimeConfig.config.browserName;
  var driver = runtimeConfig.config.driver;
  var events = playbackInfo.recordContent;
  var recordPath = playbackInfo.recordPath;
  var screenshotName;

  function handleScreenshot(outputStream, oldImagePath, next) {
    if (runtimeConfig.config.mode === consts.MODE_UPDATE) {
      imageOperations.save(outputStream, oldImagePath, next);
    } else {
      imageOperations.compareAndSaveDiffOnMismatch(
        outputStream,
        oldImagePath,
        recordPath,
        function(err, areSame) {
          if (err) return next(err);

          if (!areSame) {
            return next(
              'New screenshot looks different. ' +
              'The diff image is saved for you to examine.'
            );
          }

          next();
        }
      );
    }
  }

  // pass `_next` as the callback when the current simulated event
  // completes
  function _next(err) {
    if (err) return next(err);

    var currentEvent = events[currentEventIndex];
    var fn;

    if (currentEventIndex === events.length - 1) {
      screenshotName = imageOperations.getImageName(browserName, screenshotIndex);
      console.log('  Taking screenshot ' + screenshotName);
      fn = simulateScreenshot.bind(
        null,
        driver,
        playbackInfo.screenSize,
        browserName,
        function(err, outputStream) {
          if (err) {
            return next(err);
          }

          var oldImagePath = path.join(recordPath, screenshotName);

          handleScreenshot(outputStream, oldImagePath, function(err) {
            imageOperations.removeDanglingImages(
              playbackInfo.recordPath,
              browserName,
              screenshotIndex + 1,
              function(err2) {
                next(err || err2 || null);
              }
            );
          });
        }
      );
    } else {
      switch (currentEvent.action) {
        case consts.STEP_CLICK:
          console.log('  Clicking (%s, %s)', currentEvent.x, currentEvent.y);
          fn = simulateClick.bind(
            null, driver, currentEvent.x, currentEvent.y, _next
          );
          break;
        case consts.STEP_KEYPRESS:
          console.log('  Typing ' + currentEvent.key);
          fn = simulateKeypress.bind(null, driver, currentEvent.key, _next);
          break;
        case consts.STEP_SCREENSHOT:
          screenshotName = imageOperations.getImageName(browserName, screenshotIndex);
          screenshotIndex++;

          console.log('  Taking screenshot ' + screenshotName);
          fn = simulateScreenshot.bind(null, driver, playbackInfo.screenSize, browserName, function(err, outputStream) {
            if (err) {
              return _next(err);
            }
            var oldImagePath = path.join(recordPath, screenshotName);
            handleScreenshot(outputStream, oldImagePath, _next);
          });
          break;
        case consts.STEP_PAUSE:
          fn = function() {
            console.log('  Pause for %s ms'.grey, currentEvent.ms);
            setTimeout(_next, currentEvent.ms);
          };
          break;
        case consts.STEP_SCROLL:
          console.log('  Scrolling to (%s, %s)', currentEvent.x, currentEvent.y);
          // this is really just to provide a visual cue during replay. Selenium
          // records the whole page anyways
          // we should technically set a delay here, but OSX' smooth scrolling
          // would look really bad, adding the delay that Selenium has already
          fn = simulateScroll.bind(
            null,
            driver,
            currentEvent.x,
            currentEvent.y,
            _next
          );
          break;
      }
    }

    currentEventIndex++;
    fn();
  }

  // Selenium chromedriver screenshot captures the scrollbar, whose changing
  // transparency screws with the screenshot diffing. Hide it. This doesnt work
  // on firefox; fortunately, Selenium also doesn't capture the scroll bar in
  // screenshot in ff

  // it seems that we also need to trigger a scrolling to make the hiding work
  // TODO: try offsetHeight
  if (browserName === 'chrome') {
    driver.executeScript(
      'var _huxleyStyle = document.createElement("style");' +
      '_huxleyStyle.type = "text/css";' +
      '_huxleyStyle.innerHTML = "body::-webkit-scrollbar {width: 0 !important}";' +
      'document.getElementsByTagName("head")[0].appendChild(_huxleyStyle);' +
      'var oldOverflowValue = document.body.style.overflow;' +
      'document.body.style.overflow = "hidden";' +
      'window.scrollTo(0, 10);' +
      'window.scrollTo(0, 0);' +
      'document.body.style.overflow = oldOverflowValue;'
    )
    .then(_next);
  } else {
    _next();
  }
}

module.exports = playback;
