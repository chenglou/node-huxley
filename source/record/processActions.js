'use strict';

var _ = require('lodash');
var consts = require('../constants');

function insertPauses(actions) {
  var previousScreenshotIsLivePlayback = false;
  var res = [];

  for (var i = 0; i < actions.length; i++) {
    var currAction = actions[i];
    res.push(currAction);

    if (currAction.action === consts.STEP_SCREENSHOT) {
      previousScreenshotIsLivePlayback = currAction.livePlayback;
    }

    if (!previousScreenshotIsLivePlayback || i === actions.length - 1) {
      continue;
    }

    res.push({
      action: consts.STEP_PAUSE,
      ms: actions[i + 1].timeStamp - currAction.timeStamp
    });
  }

  return res;
}

function processActions(browserActions, screenshotActions) {
  var sortedActions = browserActions
    .concat(screenshotActions)
    .sort(function(a, b) {
      return a.timeStamp - b.timeStamp;
    });

  // every browser event happening after the last screenshot event is
  // useless. Trim them

  // TODO: maybe, instead of doing this, add a last screenshot here. It's
  // mostly due to mistakes
  while (sortedActions.length &&
      _.last(sortedActions).action !== consts.STEP_SCREENSHOT) {
    sortedActions.pop();
  }
  if (!sortedActions.length) {
    // no screenshot actions
    return [];
  }

  var res = insertPauses(sortedActions);
  res.forEach(function(action) {
    // no need for these keys anymore
    delete action.livePlayback;
    delete action.timeStamp;
  });

  return res;
}

module.exports = processActions;
