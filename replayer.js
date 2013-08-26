var imageOperations = require('./imageOperations');

function simulateEvents(driver, steps, options, callback) {
  if (steps.length === 0) {
    // TODO: not throw
    throw 'no steps';
  }

  var sleepFactor = options.sleepFactor || 1;
  var compareWithOldImages = options.compareWithOldImages || false;
  var taskDir = options.taskDir || '';

  // kickstart the console messages
  console.log(
    '  Sleeping for %s ms', (steps[0].offsetTime * sleepFactor).toFixed(1)
  );

  var timeoutQueue = [];

  steps.forEach(function(step, i) {
    var realOffsetTime = step.offsetTime * sleepFactor;

    var func;
    if (step.action === 'screenshot') {
      if (i === steps.length - 1) {
        func = function() {
          _simulateEvent(driver, step, taskDir, compareWithOldImages, function(notSame) {
            if (notSame) {
              timeoutQueue.forEach(function(id) {
                clearTimeout(id);
              });
              console.log('fail');
              return;
            }
            callback();
          });
        };
      } else {
        func = function() {
          _simulateEvent(driver, step, taskDir, compareWithOldImages, function(notSame) {
            if (notSame) {
              timeoutQueue.forEach(function(id) {
                clearTimeout(id);
              });
              console.log('fail');
              return;
            }
            console.log(
              '  Sleeping for %s ms',
              (steps[i + 1].offsetTime * sleepFactor - realOffsetTime).toFixed(1)
            );
          });
        };
      }
    } else {
      // there's no way a non-screenshot step can be the last action, we've
      // decided so when we saved the record.json file
      func = function() {
        _simulateEvent(driver, step);
        console.log(
          '  Sleeping for %s ms',
          (steps[i + 1].offsetTime * sleepFactor - realOffsetTime).toFixed(1)
        );
      };
    }

    timeoutQueue.push(setTimeout(func, realOffsetTime));
  });
}

function _simulateEvent(driver, step, taskDir, compareWithOldImages, callback) {
  if (typeof compareWithOldImages === 'function') {
    callback = compareWithOldImages;
  }
  var eventName = step.action;
  var offsetTime = step.offsetTime;
  // eventParams varies according to the event passed
  switch (eventName) {
    case 'click':
      // parameter is an array for (x, y) coordinates of the click
      var posX = step.pos[0];
      var posY = step.pos[1];
      console.log('  Clicking [%s, %s]', posX, posY);

      driver
        .executeScript(
          'document.elementFromPoint(' + posX + ', ' + posY + ').click();'
        ).then(function() {
          return driver.executeScript(
            'return document.elementFromPoint(' + posX + ', ' + posY + ');'
          );
        }).then(function(element) {
          return element.getTagName();
        }).then(function(tagName) {
          // clicking on a form item doesn't actually focus it; do it this way
          if (tagName === 'input' ||
            tagName === 'textarea' ||
            tagName === 'select') {
            driver.executeScript(
              'document.elementFromPoint(' + posX + ', ' + posY + ').focus();'
            );
          } else {
            // if it's not a form item, unfocus it so that the next potential
            // keyup is not accidentally sent to inputs
            driver.executeScript(
              'document.activeElement.blur();'
            );
          }
        });
      break;
    case 'screenshot':
      // parameter is the screenshot index
      var index = step.index;
      console.log('  Taking screenshot ' + index);

      // TODO: currently screenshot taking is fast, but if it's slow, might step
      // on next actions
      driver
        .takeScreenshot()
        .then(function(tempImage) {
          var oldImagePath = taskDir + '/screenshot' + index + '.png';
          // TODO: remove dir somewhere
          if (compareWithOldImages) {
            imageOperations.compareAndSaveDiffOnMismatch(
              // TODO: dir/path, choose one
              tempImage, oldImagePath, taskDir, function(err, areSame) {
                callback && callback(!areSame);
              }
            );
          } else {
            imageOperations.writeToFile(oldImagePath, tempImage, function(err) {
              callback && callback(err);
            });
          }
        });
      break;
    case 'keyup':
      // parameter is the key pressed
      var key = step.key;
      console.log('  Typing ' + key);

      driver
        .executeScript(
          'return document.activeElement;'
        ).then(function(activeElement) {
          if (activeElement) {
            activeElement.sendKeys(key.toLowerCase());
          }
        });
      break;
    default:
      // TODO: really throw?
      throw 'unrecognized user event';
  }
}

module.exports = {
  simulateEvents: simulateEvents
};

// var testjson = [
//   {
//     "action": "screenshot",
//     "index": 0,
//     "offsetTime": 400
//   },
//   {
//     "action": "click",
//     "offsetTime": 800,
//     "pos": [182, 214]
//   },
//   {
//     "action": "keyup",
//     "offsetTime": 1100,
//     "key": "A"
//   },
//   {
//     "action": "click",
//     "offsetTime": 1300,
//     "pos": [121, 260]
//   },
//   {
//     "action": "keyup",
//     "offsetTime": 1600,
//     "key": "B"
//   },
//   {
//     "action": "click",
//     "offsetTime": 1900,
//     "pos": [513, 340]
//   },
//   {
//     "action": "keyup",
//     "offsetTime": 2100,
//     "key": "C"
//   },
//   {
//     "action": "screenshot",
//     "index": 1,
//     "offsetTime": 2400
//   }
// ];

// TODO: remove
// var browser = require('./browser');
// var imageOperations = require('./imageOperations');

// browser.openToUrl('localhost:8000', 1000, 1000, function(driver) {
//   simulateEvents(driver, testjson, {sleepFactor: 0.9122, compareWithOldImages: true}, function() {
//     console.log('done');
//   });
// });
