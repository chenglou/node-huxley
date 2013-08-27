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
           console.log('done taking ss');
           next(!areSame);
         }
       );
     } else {
       imageOperations.writeToFile(oldImagePath, tempImage, function(err) {
         next(err);
       });
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
      if (activeElement) {
        // TODO: case
        activeElement
          .sendKeys(key.toLowerCase())
          .then(function() {
            console.log('done key ' + key);
            next();
          });
      } else {
        next();
      }
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
          .then(function() {
            console.log('done click ', posX, posY);
            next();
          });
      } else {
        // if it's not a form item, unfocus it so that the next potential
        // keyup is not accidentally sent to inputs
        driver
          .executeScript('document.activeElement.blur();')
          .then(function() {
            console.log('done click', posX, posY);
            next();
          });
      }
    });
}


function simulateEvents(driver, events, options, done) {
  if (events.length === 0) {
    // TODO: not throw, better msg
    throw 'no events';
  }

  var sleepFactor = options.sleepFactor || 1;
  var compareWithOldImages = options.compareWithOldImages || false;
  var taskDir = options.taskDir || '';

  var currentEventIndex = 0;
  var simulationStartTime = Date.now();

  // closure
  function _next(err) {
    if (err) {
      throw err;
    }

    var fn;
    var currentEvent = events[currentEventIndex];
    if (currentEventIndex === events.length - 1) {
      // the last action is always taking a screenshot. We trimmed it so when we
      // saved the recording
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

  // kickstart the console messages
  console.log(
    '  Sleeping for %s ms', (events[0].offsetTime * sleepFactor).toFixed(1)
  );

  _next();
}

module.exports = {
  simulateEvents: simulateEvents
};
