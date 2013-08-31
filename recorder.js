'use strict';

var fs = require('fs');
var read = require('read');

var driver;
// TODO: better msg
var promptMessage = 'q/l/*:';

function startPromptAndInjectEventsScript(driver, done) {
  var screenshotCount = 0;
  var recordingStartTime;
  var screenShotEvents = [];

  // I'm sick of callbacks and promises, sync read this
  // TODO: better name
  var scriptToInject =
    fs.readFileSync(__dirname + '/eventsScriptToInject.js', 'utf8');

  driver.executeScript(scriptToInject);

  console.log('Begin record');
  console.log(
    'Type q to quit, l for taking a screenshot and marking a live playback point, and anything else to take a normal screenshot.'
  );

  // start after the page's loaded. more accurate
  recordingStartTime = Date.now();

  read({prompt: promptMessage}, function handleKeyPress(err, key) {
    if (key === 'q') return done(screenShotEvents, recordingStartTime);

    var event = {
      action: 'screenshot',
      timeOffset: Date.now(),
      index: screenshotCount
    };

    if (key === 'l') {
      event.livePlayback = true;
    }

    screenShotEvents.push(event);
    screenshotCount++;
    console.log(screenshotCount + ' screenshot recorded.');
    read({prompt: promptMessage}, handleKeyPress);
  });
}

// TODO: gutter
function stopAndGetProcessedEvents(driver, screenShotEvents, recordingStartTime, done) {
  var browserAndScreenshotEvents;
  var lastScreenshotIsLivePlayback = false;

  driver
    .executeScript('return window._getHuxleyEvents();')
    // TODO: warn if page switched (can't get events)
    .then(function(browserEvents) {
      browserAndScreenshotEvents = browserEvents
        .concat(screenShotEvents)
        .sort(function(previous, current) {
          return previous.timeOffset - current.timeOffset;
        });

      browserAndScreenshotEvents
        .map(function(event, i) {
          if (event.action === 'screenshot') {
            lastScreenshotIsLivePlayback = event.livePlayback;
          }
          if (lastScreenshotIsLivePlayback) {
            event.waitInterval = i === 0
              ? event.timeOffset - recordingStartTime
              : event.timeOffset - browserAndScreenshotEvents[i - 1].timeOffset;
          }
          return event;
        })
        .forEach(function(event) {
          // no need for these keys anymore
          delete event.timeOffset;
        });

      // every browser event happening after the last screenshot event is
      // useless. Trim them
      for (var i = browserAndScreenshotEvents.length - 1; i >= 0; i--) {
        if (browserAndScreenshotEvents[i].action !== 'screenshot') {
          browserAndScreenshotEvents.pop();
        } else {
          break;
        }
      }

      return browserAndScreenshotEvents;
    })
    .then(done);
}

module.exports = {
  startPromptAndInjectEventsScript: startPromptAndInjectEventsScript,
  stopAndGetProcessedEvents: stopAndGetProcessedEvents
};
