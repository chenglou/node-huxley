'use strict';

var Promise = require('bluebird');

var consts = require('../constants');
var readP = require('../promisified/readP');

function recordCLIUntilQuit() {
  var screenshotActions = [];

  function readPAgain() {
    return readP({prompt: '> '})
      .then(function handleKeyPress(key) {
        if (key === 'q') {
          return Promise.resolve(screenshotActions);
        }

        var action = {
          action: consts.STEP_SCREENSHOT,
          timeStamp: Date.now(),
        };

        if (key === 'l') {
          action.livePlayback = true;
        }

        screenshotActions.push(action);
        console.log('screenshot ' + screenshotActions.length + ' recorded.');

        return readPAgain();
      });
  }

  return readPAgain();
}

module.exports = recordCLIUntilQuit;
