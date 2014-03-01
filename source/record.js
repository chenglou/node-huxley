'use strict';

var fs = require('fs');
var path = require('path');
var read = require('read');

var consts = require('./constants');

function _startPromptAndInjectEventsScript(driver, next) {
  var recordingStartTime;
  var screenshotCount = 0;
  var screenshotEvents = [];

  // I'm sick of callbacks and promises, sync read this
  var scriptToInject = fs.readFileSync(
    path.join(__dirname, 'browser', 'actionTracker.js'),
    'utf8'
  );

  driver.executeScript(scriptToInject);

  console.log('Begin record');
  console.log(
    'Type q to quit, l for taking a screenshot and marking a live playback ' +
    'point til next screenshot, and anything else to take a normal screenshot.'
  );

  read({prompt: '> '}, function handleKeyPress(err, key) {
    if (key === 'q') return next(null, screenshotEvents);

    var event = {
      action: consts.STEP_SCREENSHOT,
      timeStamp: Date.now(),
    };

    if (key === 'l') event.livePlayback = true;

    screenshotEvents.push(event);
    screenshotCount++;
    console.log(screenshotCount + ' screenshot recorded.');
    read({prompt: '> '}, handleKeyPress);
  });
}

function _insertPauseEvents(events) {
  var previousScreenshotIsLivePlayback = false;
  var returnEvents = [];

  for (var i = 0; i < events.length; i++) {
    var currentEvent = events[i];
    returnEvents.push(currentEvent);

    if (currentEvent.action === consts.STEP_SCREENSHOT) {
      previousScreenshotIsLivePlayback = currentEvent.livePlayback;
    }

    if (!previousScreenshotIsLivePlayback || i === events.length - 1) continue;

    returnEvents.push({
      action: consts.STEP_PAUSE,
      ms: events[i + 1].timeStamp - currentEvent.timeStamp
    });
  }

  return returnEvents;
}

function _concatSortTrimEvents(screenshotEvents, browserEvents) {
  var allEvents = browserEvents
    .concat(screenshotEvents)
    .sort(function(previous, current) {
      return previous.timeStamp - current.timeStamp;
    });

  // every browser event happening after the last screenshot event is
  // useless. Trim them

  // TODO: maybe, instead of doing this, add a last screenshot here. It's
  // mostly due to mistakes
  for (var i = allEvents.length - 1; i >= 0; i--) {
    if (allEvents[i].action === consts.STEP_SCREENSHOT) break;

    allEvents.pop();
  }

  return allEvents;
}

function _stopAndGetProcessedEvents(driver, screenshotEvents, next) {
  driver
    // this method has been injected when selenium browser window started
    .executeScript('return window._getHuxleyEvents();')
    // TODO: warn if page switched (can't get events)
    .then(function(browserEvents) {
      var browserAndScreenshotEvents =
        _concatSortTrimEvents(screenshotEvents, browserEvents);

      browserAndScreenshotEvents =
        _insertPauseEvents(browserAndScreenshotEvents);

      browserAndScreenshotEvents.forEach(function(event) {
        // no need for these keys anymore
        delete event.livePlayback;
        delete event.timeStamp;
      });

      return browserAndScreenshotEvents;
    })
    .then(next);
}

function record(driver, next) {
  _startPromptAndInjectEventsScript(driver, function(err, screenshotEvents) {
    if (err) return next(err);

    _stopAndGetProcessedEvents(driver, screenshotEvents, function(allEvents) {
      // no err here
      next(null, allEvents);
    });
  });
}

module.exports = record;
