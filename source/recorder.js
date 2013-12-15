'use strict';

var fs = require('fs');
var read = require('read');

var consts = require('./constants');

function startPromptAndInjectEventsScript(driver, next) {
  var screenshotCount = 0;
  var recordingStartTime;
  var screenshotEvents = [];

  // I'm sick of callbacks and promises, sync read this
  var scriptToInject = fs.readFileSync(__dirname + '/bigBrother.js', 'utf8');

  driver.executeScript(scriptToInject);

  console.log('Begin record');
  console.log(
    'Type q to quit, l for taking a screenshot and marking a live playback ' +
    'point til next screenshot, and anything else to take a normal screenshot.'
  );

  read({prompt: '> '}, function handleKeyPress(err, key) {
    if (key === 'q') return next(screenshotEvents);

    var event = {
      action: consts.STEP_SCREENSHOT,
      timeStamp: Date.now(),
    };

    if (key === 'l') {
      event.livePlayback = true;
    }

    screenshotEvents.push(event);
    screenshotCount++;
    console.log(screenshotCount + ' screenshot recorded.');
    read({prompt: '> '}, handleKeyPress);
  });
}

function stopAndGetProcessedEvents(driver, screenshotEvents, next) {
  var browserAndScreenshotEvents;
  var prevScreenshotIsLivePlayback = false;

  driver
    // this method has been injected when selenium browser window started
    .executeScript('return window._getHuxleyEvents();')
    // TODO: warn if page switched (can't get events)
    .then(function(browserEvents) {
      browserAndScreenshotEvents = browserEvents
        .concat(screenshotEvents)
        .sort(function(previous, current) {
          return previous.timeStamp - current.timeStamp;
        });

      // every browser event happening after the last screenshot event is
      // useless. Trim them

      // TODO: maybe, instead of doing this, add a last screenshot here. It's
      // mostly due to mistakes
      for (var i = browserAndScreenshotEvents.length - 1; i >= 0; i--) {
        if (browserAndScreenshotEvents[i].action === consts.STEP_SCREENSHOT) break;

        browserAndScreenshotEvents.pop();
      }

      var j = 0;
      var currentEvent;
      while (j < browserAndScreenshotEvents.length) {
        currentEvent = browserAndScreenshotEvents[j];

        if (currentEvent.action === consts.STEP_SCREENSHOT) {
          prevScreenshotIsLivePlayback = currentEvent.livePlayback;
        }

        if (!prevScreenshotIsLivePlayback ||
            j === browserAndScreenshotEvents.length - 1) {
          j++;
          continue;
        }

        // previous for loop and last conditional garantees this isn't a
        // screenshot event
        var actionToAdd = {
          action: consts.STEP_PAUSE,
          ms: browserAndScreenshotEvents[j + 1].timeStamp -
              currentEvent.timeStamp
        };

        browserAndScreenshotEvents.splice(j + 1, 0, actionToAdd);
        j += 2;
        continue;
      }

      browserAndScreenshotEvents.forEach(function(event) {
        // no need for these keys anymore
        delete event.livePlayback;
        delete event.timeStamp;
      });

      return browserAndScreenshotEvents;
    })
    .then(next);
}

module.exports = {
  startPromptAndInjectEventsScript: startPromptAndInjectEventsScript,
  stopAndGetProcessedEvents: stopAndGetProcessedEvents
};
