var fs = require('fs');
var keypress = require('keypress');

var driver;
var enterPromptMessage =
  'Press enter to take a screenshot, or type Q + enter if you\'re done.';

function start(driver, done) {
  var screenshotCount = 0;
  var recordingStartTime;
  var screenShotTimes = [];

  // I'm sick of callbacks and promises, sync read this
  var scriptToInject =
    fs.readFileSync(__dirname + '/eventsScriptToInject.js', 'utf8');

  driver.executeScript(scriptToInject);

  console.log('Begin record');
  console.log(enterPromptMessage);

  // start after the page's loaded (`get` up there). more accurate
  recordingStartTime = Date.now();

  keypress(process.stdin);

  process.stdin.on('keypress', function handleKeyPress(char, key) {
    if (!key) throw 'No key input received';

    if (key.name === 'enter') {
      screenShotTimes.push(
        [Date.now(), 'screenshot', screenshotCount]
      );
      screenshotCount++;
      console.log(screenshotCount + ' screenshot recorded.');
      console.log(enterPromptMessage);

    } else if (key.name === 'q') {
      // quitting
      process.stdin.removeListener('keypress', handleKeyPress);
      done(screenShotTimes, recordingStartTime);
    }
  });
}

function stop(driver, screenShotTimes, done) {
  // this will not only include the browser events, but also the screenshot
  // keypress events
  var allEvents;

  driver
    .executeScript('return window._getHuxleyEvents();')
    .then(function(recordedBrowserEvents) {
      allEvents = recordedBrowserEvents
        .concat(screenShotTimes)
        .sort(function(prev, curr) {
          // each array item is of the format [timeStamp, action, miscInfo]
          // e.g. [1231, 'keypress', 103]
          return prev[0] - curr[0];
        });
      for (var i = allEvents.length - 1; i >= 0; i--) {
        // every browser event happening after the last screenshot event is
        // useless. Trim them
        if (allEvents[i][1] !== 'screenshot') {
          allEvents.pop();
        } else {
          break;
        }
      }
    })
    .then(function() {
      done(allEvents);
    });
}

module.exports = {
  start: start,
  stop: stop
};
