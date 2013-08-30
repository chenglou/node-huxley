'use strict';

var fs = require('fs');
var keypress = require('keypress');

var driver;
var enterPromptMessage =
  'Press enter to take a screenshot, or type Q + enter if you\'re done.';

function startPromptAndInjectEventsScript(driver, done) {
  var screenshotCount = 0;
  var recordingStartTime;
  var screenShotEvents = [];

  // I'm sick of callbacks and promises, sync read this
  var scriptToInject =
    fs.readFileSync(__dirname + '/eventsScriptToInject.js', 'utf8');

  driver.executeScript(scriptToInject);

  console.log('Begin record');
  console.log(enterPromptMessage);

  // start after the page's loaded. more accurate
  recordingStartTime = Date.now();

  keypress(process.stdin);
  // TODO: maybe auto record the first ss
  process.stdin.on('keypress', function handleKeyPress(char, key) {
    if (!key) throw 'No key input received';

    if (key.name === 'enter') {
      screenShotEvents.push({
        action: 'screenshot',
        timeOffset: Date.now(),
        index: screenshotCount
      });
      screenshotCount++;
      console.log(screenshotCount + ' screenshot recorded.');
      console.log(enterPromptMessage);

    } else if (key.name === 'q') {
      // quitting
      process.stdin.removeListener('keypress', handleKeyPress);
      done(screenShotEvents, recordingStartTime);
    }
  });
}

// TODO: gutter
function stopAndGetProcessedEvents(driver, screenShotEvents, recordingStartTime, done) {
  var browserAndScreenshotEvents;

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
          event.waitInterval = i === 0
            ? event.timeOffset - recordingStartTime
            : event.timeOffset - browserAndScreenshotEvents[i - 1].timeOffset;
          return event;
        })
        .forEach(function(event) {
          // no need for this key anymore
          delete event.timeOffset;
        });

      for (var i = browserAndScreenshotEvents.length - 1; i >= 0; i--) {
        // every browser event happening after the last screenshot event is
        // useless. Trim them
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
