'use strict';

// TODO: input focus aura problem
var imageOperations = require('./imageOperations');
var colors = require('colors');
var specialKeys = require('selenium-webdriver').Key;

function _simulateScreenshot(driver, event, taskPath, compareWithOldOne, next) {
  // parameter is the index of the screenshot
  // TODO: generate this, don't keep it in record.json
  console.log('  Taking screenshot ' + event.index);

  driver
   .takeScreenshot()
   .then(function(tempImage) {
    // TODO: shorter img name, and with browser name
    var oldImagePath = taskPath + '/screenshot' + event.index + '.png';
    // TODO: remove dir somewhere
    if (compareWithOldOne) {
      imageOperations.compareAndSaveDiffOnMismatch(
        tempImage, oldImagePath, taskPath, function(err, areSame) {
          if (err) return next(err);
          if (!areSame) {
            return next(
              'New screenshot looks different! The diff image is saved for ' +
              'you to examine.'
            );
          }
          next();
       }
      );
    } else {
      imageOperations.writeToFile(oldImagePath, tempImage, next);
    }
   });
}

function _simulateKeypress(driver, event, next) {
  // parameter is the key pressed
  var key = event.key;
  console.log('  Typing ' + key);

  driver
    .executeScript('return document.activeElement;')
    .then(function(activeElement) {
      if (!activeElement) return next();

      // refer to `bigBrother.js`. The special keys are the arrow keys, stored
      // like 'ARROW_LEFT', By chance, the webdriver's `Key` object store these
      // keys
      if (key.length > 1) key = specialKeys[key];
      activeElement
        .sendKeys(key)
        .then(next);
    });
}

// TODO: handle friggin select menu click, can't right now bc browsers
function _simulateClick(driver, event, next) {
  // parameter is an array for (x, y) coordinates of the click
  var posX = event.position[0];
  var posY = event.position[1];
  console.log('  Clicking [%s, %s]', posX, posY);

  var posString = '(' + posX + ', ' + posY + ')';
  driver
    // TODO: isolate this into a script file clicking on an input/textarea
    // element focuses it but doesn't place the carret at the correct position;
    // do it here (only works for ff)
    .executeScript(
      'var el = document.elementFromPoint' + posString + ';' +
      'if ((el.tagName === "TEXTAREA" || el.tagName === "INPUT") && document.caretPositionFromPoint) {' +
        'var range = document.caretPositionFromPoint' + posString + ';' +
        'var offset = range.offset;' +
        'document.elementFromPoint' + posString + '.setSelectionRange(offset, offset);' +
      '}' +
      'return document.elementFromPoint' + posString + ';'
    )
    .then(function(el) {
      el.click();
    })
    .then(next);
}

function playback(driver, events, options, done) {
  if (events.length === 0) return done('No previously recorded events.');

  var compareWithOldImages = options.compareWithOldImages || false;
  var taskPath = options.taskPath || '';

  var currentEventIndex = 0;

  // pass `_next` or `done` as the callback when the current simulated event
  // completes
  function _next(err) {
    if (err) return done(err);

    var fn;
    var currentEvent = events[currentEventIndex];

    if (currentEventIndex === events.length - 1) {
      // the last action is always taking a screenshot. We trimmed it so when we
      // saved the recording
      fn = _simulateScreenshot.bind(
        null, driver, currentEvent, taskPath, compareWithOldImages, done
      );
    } else {
      switch (currentEvent.action) {
        case 'click':
          fn = _simulateClick.bind(null, driver, currentEvent, _next);
          break;
        case 'keypress':
          fn = _simulateKeypress.bind(null, driver, currentEvent, _next);
          break;
        case 'screenshot':
          fn = _simulateScreenshot.bind(
            null, driver, currentEvent, taskPath, compareWithOldImages, _next
          );
          break;
        case 'pause':
          fn = function() {
            console.log('  Pause for %s ms'.grey, currentEvent.ms);
            setTimeout(_next, currentEvent.ms);
          };
          break;
        default:
          return done(
            'Unrecognized user action. Record.json might have been modified'
          );
      }
    }

    currentEventIndex++;
    fn();
  }

  _next();
}

module.exports = playback;
