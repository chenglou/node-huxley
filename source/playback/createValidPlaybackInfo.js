'use strict';

var consts = require('../constants');

function createPlaybackInfo(info, verifyRecordContent) {
  var returnObj = {
    isSkipped: info.isSkipped || false,

    // TODO: some fields belong to a global playback info
    browserName: info.browserName,
    driver: info.driver,
    overrideScreenshots: info.overrideScreenshots || false,
    recordContent: info.recordContent,
    recordPath: info.recordPath,
    screenSize: info.screenSize || consts.DEFAULT_SCREEN_SIZE,
    url: info.url
  };

  if (!verifyRecordContent) return returnObj;

  var errMessage = _verifyRecordContent(returnObj.recordContent);
  if (errMessage) return errMessage;
  return returnObj;
}

var validRecordedActions = [
  consts.STEP_SCREENSHOT,
  consts.STEP_CLICK,
  consts.STEP_KEYPRESS,
  consts.STEP_PAUSE,
  consts.STEP_SCROLL
];

function _isValidAction(action) {
  return validRecordedActions.some(function(validAction) {
    return validAction === action;
  });
}

function _verifyRecordContent(content) {
  if (!Array.isArray(content)) {
    return consts.RECORD_FILE_NAME + ' should be an array.';
  }

  if (content.length === 0) return 'Empty playback record.';

  for (var i = 0; i < content.length; i++) {
    var action = content[i];
    var isValid = _isValidAction(action.action);

    if (!isValid) {
      return (
        'Unrecognized user action "' + action.action +
        '". The internal playback record might have been modified.'
      );
    }

    if (i === content.length - 1 && action.action !== consts.STEP_SCREENSHOT) {
      return 'The last recorded item should have been a screenshot';
    }
  }

  return null;
}

module.exports = createPlaybackInfo;
