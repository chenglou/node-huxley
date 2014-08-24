'use strict';

var _ = require('lodash');
var consts = require('../constants');
var insertPauses = require('./insertPauses');

// every browser event happening after the last screenshot event is useless.
// Trim them
function trimActions(actions) {
  // TODO: maybe, instead of doing this, add a last screenshot here. It's
  // mostly due to mistakes
  var lastScreenshotIndex = _.findLastIndex(actions, function(a) {
    return a.action === consts.STEP_SCREENSHOT;
  });
  return actions.slice(0, lastScreenshotIndex + 1);
}

function processActions(browserActions, screenshotActions) {
  var actions = trimActions(
      browserActions
        .concat(screenshotActions)
        .sort(function(a, b) {
          return a.timeStamp - b.timeStamp;
        })
    );

  // no need for the live playback markers anymore
  var res = insertPauses(actions).filter(function(a) {
    return a.action !== consts.STEP_LIVE_PLAYBACK;
  });

  res.forEach(function(action) {
    // no need for this key anymore
    delete action.timeStamp;
  });

  return res;
}

module.exports = processActions;
