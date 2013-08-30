'use strict';

// TODO: input focus aura problem
var imageOperations = require('./imageOperations');
var colors = require('colors');
var specialKeys = require('selenium-webdriver').Key;

var HTML_FORM_ELEMENTS = 'input textarea select keygen a button'.split(' ');

function _simulateScreenshot(driver, event, taskPath, compareWithOldOne, next) {
  // parameter is the index of the screenshot
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

function _simulateClick(driver, event, next) {
  // parameter is an array for (x, y) coordinates of the click
  var posX = event.pos[0];
  var posY = event.pos[1];
  console.log('  Clicking [%s, %s]', posX, posY);

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

  var sleepFactor = options.sleepFactor == null ? 1 : options.sleepFactor;
  var compareWithOldImages = options.compareWithOldImages || false;
  var taskPath = options.taskPath || '';

  var currentEventIndex = 0;
  var simulationStartTime = Date.now();

  // the initial idea was to pass through the events array and simply do a
  // `setTimeout(func, events[i].offsetTime)`, where `func` is the function
  // corresponding to the event we want to reproduce, e.g. `_simulateClick`. But
  // this causes some concurrency issue when sleepTime is set to < 0.2. The new
  // way is to pass `_next` (or `done`) as a _callback_ to `func`, and set the
  // correct timer to trigger func. See below
  function _next(err) {
    if (err) return done(err);

    var fn;
    var currentEvent = events[currentEventIndex];

    var sleepDuration = currentEventIndex === 0
      ? currentEvent.offsetTime
      : currentEvent.offsetTime - events[currentEventIndex - 1].offsetTime;

    console.log(
      '  Sleeping for %s ms'.grey, (sleepDuration * sleepFactor).toFixed(1)
    );

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

    // while we could have easily set the time interval to the difference
    // between the current event and the previous, this doesn't take into
    // consideration the time taken to execute the simulation itself (which is
    // why we were having concurrency issue in the first place). We correct that
    // here with the last two timestamps
    setTimeout(
      fn,
      currentEvent.offsetTime * sleepFactor - Date.now() + simulationStartTime
    );
    currentEventIndex++;
  }

  _next();
}

module.exports = playback;
