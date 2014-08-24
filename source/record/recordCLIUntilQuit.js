'use strict';

var Promise = require('bluebird');

var consts = require('../constants');
var readP = require('../promisified/readP');

function recordCLIUntilQuit() {
  var actions = [];
  var screenshotCount = 0;
  var wasLiveplayback = false;

  function readPAgain() {
    return readP({prompt: '> '})
      .then(function handleKeyPress(key) {
        if (key === 'q') {
          return Promise.resolve(actions);
        }

        if (key === 'l') {
          actions.push({
            action: consts.STEP_LIVE_PLAYBACK,
            timeStamp: Date.now(),
          });
          console.log(
            wasLiveplayback ? 'Live playback off.': 'Live playback on.'
          );
          wasLiveplayback = !wasLiveplayback;

          return readPAgain();
        }

        actions.push({
          action: consts.STEP_SCREENSHOT,
          timeStamp: Date.now(),
        });
        console.log('screenshot ' + (++screenshotCount) + ' recorded.');

        return readPAgain();
      });
  }

  return readPAgain();
}

module.exports = recordCLIUntilQuit;
