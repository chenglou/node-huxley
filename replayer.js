// TODO: use strict
var imageOperations = require('./imageOperations');
// TODO: ew file name replayer

function _simulateScreenshot(driver, event, taskDir, compareWithOldOne, next) {
  console.log('  Taking screenshot ' + event.index); // screenshot index

  driver
   .takeScreenshot()
   .then(function(tempImage) {
     var oldImagePath = taskDir + '/screenshot' + event.index + '.png';
     // TODO: remove dir somewhere
     if (compareWithOldOne) {
       imageOperations.compareAndSaveDiffOnMismatch(
          // TODO: dir/path, choose one
          tempImage, oldImagePath, taskDir, function(err, areSame) {
            if (err) return next(err);
            next(!areSame);
         }
       );
     } else {
       imageOperations.writeToFile(oldImagePath, tempImage, next);
     }
   });
}

function _simulateKeyup(driver, event, next) {
  // parameter is the key pressed
  var key = event.key;
  console.log('  Typing ' + key);

  driver
    .executeScript('return document.activeElement;')
    .then(function(activeElement) {
      if (!activeElement) return next();
      // TODO: upper case
      activeElement
        .sendKeys(key.toLowerCase())
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
      if (tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select') {
        driver
          .executeScript(
            'document.elementFromPoint(' + posX + ', ' + posY + ').focus();'
          )
          .then(next);
      } else {
        // if it's not a form item, unfocus it so that the next potential
        // keyup is not accidentally sent to inputs
        driver
          .executeScript('document.activeElement.blur();')
          .then(next);
      }
    });
}

function simulateEvents(driver, events, options, done) {
  if (events.length === 0) {
    // TODO: not throw, better msg
    throw 'no events';
  }

  var sleepFactor = options.sleepFactor == null ? 1 : options.sleepFactor;
  var compareWithOldImages = options.compareWithOldImages || false;
  var taskDir = options.taskDir || '';

  var currentEventIndex = 0;
  var simulationStartTime = Date.now();

  // TODO: explain
  // closure
  function _next(err) {
    if (err) {
      throw err;
    }

    var fn;
    var currentEvent = events[currentEventIndex];

    var sleepDuration = currentEventIndex === 0
      ? currentEvent.offsetTime
      : currentEvent.offsetTime - events[currentEventIndex - 1].offsetTime;

    console.log(
      '  Sleeping for %s ms', (sleepDuration * sleepFactor).toFixed(1)
    );

    if (currentEventIndex === events.length - 1) {
      // the last action is always taking a screenshot. We trimmed it so when we
      // saved the recording
      // TODO: wrap
      fn = _simulateScreenshot.bind(null, driver, currentEvent, taskDir, compareWithOldImages, done);
    } else {
      switch (currentEvent.action) {
        case 'click':
          fn = _simulateClick.bind(null, driver, currentEvent, _next);
          break;
        case 'keyup':
          fn = _simulateKeyup.bind(null, driver, currentEvent, _next);
          break;
        case 'screenshot':
          fn = _simulateScreenshot.bind(null, driver, currentEvent, taskDir, compareWithOldImages, _next);
          break;
      }
    }

    // TODO: comment here
    setTimeout(fn, currentEvent.offsetTime * sleepFactor - Date.now() + simulationStartTime);
    currentEventIndex++;
  }

  _next();
}

module.exports = {
  simulateEvents: simulateEvents
};
