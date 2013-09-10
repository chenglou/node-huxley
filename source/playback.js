'use strict';

// TODO: input focus aura problem
var imageOperations = require('./imageOperations');
var colors = require('colors');
var specialKeys = require('selenium-webdriver').Key;

function _simulateScreenshot(driver, index, taskPath, compareWithOld, next) {
  // parameter is the index of the screenshot
  console.log('  Taking screenshot ' + index);

  driver
   .takeScreenshot()
   .then(function(tempImage) {
    // TODO: browser name
    var oldImagePath = taskPath + '/' + index + '.png';
    if (compareWithOld) {
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

function _simulateKeypress(driver, key, next) {
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
function _simulateClick(driver, posX, posY, next) {
  var posString = '(' + posX + ', ' + posY + ')';
  console.log('  Clicking ' + posString);

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

  var compareWithOld = options.compareWithOld || false;
  var taskPath = options.taskPath || '';

  var currentEventIndex = 0;
  var screenshotCount = 1;

  // pass `_next` or `done` as the callback when the current simulated event
  // completes
  function _next(err) {
    if (err) return done(err);

    var fn;
    var currentEvent = events[currentEventIndex];

    if (currentEventIndex === events.length - 1) {
      // the last action is always taking a screenshot. We trimmed the rest when
      // we saved the recording
      fn = _simulateScreenshot.bind(null, driver, screenshotCount, taskPath,
        compareWithOld, function(err) {
          if (err) return done(err);

          imageOperations.removeDanglingImages(
            taskPath, screenshotCount + 1, done
          );
        }
      );
    } else {
      switch (currentEvent.action) {
        case 'click':
          fn = _simulateClick.bind(
            null, driver, currentEvent.x, currentEvent.y, _next
          );
          break;
        case 'keypress':
          fn = _simulateKeypress.bind(null, driver, currentEvent.key, _next);
          break;
        case 'screenshot':
          fn = _simulateScreenshot.bind(
            null, driver, screenshotCount++, taskPath, compareWithOld, _next
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
