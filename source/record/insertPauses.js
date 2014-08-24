'use strict';

var consts = require('../constants');

function insertPauses(actions) {
  var livePlayback = false;
  var res = [];

  for (var i = 0; i < actions.length; i++) {
    var a = actions[i];
    res.push(a);

    if (a.action === consts.STEP_LIVE_PLAYBACK) {
      livePlayback = !livePlayback;
    }

    if (livePlayback && i !== actions.length - 1) {
      res.push({
        action: consts.STEP_PAUSE,
        ms: actions[i + 1].timeStamp - a.timeStamp,
      });
    }
  }

  return res;
}

module.exports = insertPauses;
