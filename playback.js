'use strict';

// TODO: input focus aura problem
var imageOperations = require('./imageOperations');
var colors = require('colors');
var specialKeys = require('selenium-webdriver').Key;

var HTML_FORM_ELEMENTS = 'input textarea select keygen a button'.split(' ');

function _simulateScreenshot(driver, event, taskPath, compareWithOldOne, next) {
  // parameter is the index of the screenshot
  // TODO: generate this, don't keep it in record.json
  console.log('  Taking screenshot ' + event.index);

  driver
   .takeScreenshot()
   .then(function(tempImage) {
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

      // refer to `eventScriptToInject.js`. The special keys are the arrow keys,
      // stored like 'ARROW_LEFT', By chance, the webdriver's `Key` object store
      // these keys
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

  // TODO: try sendclick instead
  driver
    .executeScript(
      'document.elementFromPoint(' + posX + ', ' + posY + ').click();'
    )
    .then(function() {
      return driver.executeScript(
        'return document.elementFromPoint(' + posX + ', ' + posY + ');'
      );
    })
    .then(function(element) {
      return element.getTagName();
    })
    .then(function(tagName) {
      // clicking on a form item doesn't actually focus it; do it this way
      if (HTML_FORM_ELEMENTS.indexOf(tagName) !== -1) {
        driver
          .executeScript(
            'document.elementFromPoint(' + posX + ', ' + posY + ').focus();'
          )
          .then(next);
      } else {
        // if it's not a form item, unfocus it so that the next potential
        // keypress is not accidentally sent to inputs
        driver
          .executeScript('document.activeElement.blur();')
          .then(next);
      }
    });
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

    if (currentEvent.waitInterval) {
      console.log('  Pause for %s ms'.grey, currentEvent.waitInterval);
    }

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
        default:
          return done('Unrecognized user event.');
      }
    }

    setTimeout(fn, currentEvent.waitInterval || 0);
    currentEventIndex++;
  }

  _next();
}

module.exports = playback;
