// var testjson = [
//   {
//     "command": "screenshot",
//     "index": 0,
//     "offsetTime": 400
//   },
//   {
//     "command": "click",
//     "offsetTime": 800,
//     "pos": [182, 214]
//   },
//   {
//     "command": "keypress",
//     "offsetTime": 1100,
//     "key": "A"
//   },
//   {
//     "command": "click",
//     "offsetTime": 1300,
//     "pos": [121, 260]
//   },
//   {
//     "command": "keypress",
//     "offsetTime": 1600,
//     "key": "B"
//   },
//   {
//     "command": "click",
//     "offsetTime": 1900,
//     "pos": [513, 340]
//   },
//   {
//     "command": "keypress",
//     "offsetTime": 2100,
//     "key": "C"
//   },
//   {
//     "command": "screenshot",
//     "index": 1,
//     "offsetTime": 2400
//   }
// ];

var imageOperations = require('./imageOperations');

function simulateEvents(driver, steps, options, callback) {
  var sleepFactor = options.sleepFactor || 1;
  var compareWithOldImages = options.compareWithOldImages || false;

  // kickstart the console messages
  console.log(
    '  Sleeping for %s ms', (steps[0].offsetTime * sleepFactor).toFixed(1)
  );

  var timeoutQueue = [];

  steps.forEach(function(step, i) {
    var realOffsetTime = step.offsetTime * sleepFactor;

    var func;
    if (step.command === 'screenshot') {
      if (i === steps.length - 1) {
        func = function() {
          _simulateEvent(driver, step, compareWithOldImages, function(notSame) {
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
          _simulateEvent(driver, step, compareWithOldImages, function(notSame) {
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
      // there's no way a non-screenshot step can be the last command, we've
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

function _simulateEvent(driver, step, compareWithOldImages, callback) {
  if (typeof compareWithOldImages === 'function') {
    callback = compareWithOldImages;
  }
  var eventName = step.command;
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
            // keypress is not accidentally sent to inputs
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
          var oldImagePath = 'screenshot' + index + '.png';

          if (compareWithOldImages) {
            imageOperations.compareAndSaveDiffOnMismatch(
              tempImage, oldImagePath, function(err, areSame) {
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
    case 'keypress':
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

// TODO: remove
// var browser = require('./browser');
// var imageOperations = require('./imageOperations');

// browser.openToUrl('localhost:8000', 1000, 1000, function(driver) {
//   simulateEvents(driver, testjson, {sleepFactor: 0.9122, compareWithOldImages: true}, function() {
//     console.log('done');
//   });
// });
