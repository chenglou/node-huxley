'use strict';

var consts = require('../constants');

function createHuxleyfileInfo(info) {
  var returnObj = {
    huxleyfileContent: info.huxleyfileContent,
    path: info.path
  };

  var errMessage = _verifyHuxleyfileContent(returnObj.huxleyfileContent);
  if (errMessage) return errMessage;
  return returnObj;
}

function _verifyTasks(huxleyfile) {
  for (var j = 0; j < huxleyfile.length; j++) {
    var task = huxleyfile[j];

    if (!task.name && !task.xname) {
      return consts.HUXLEYFILE_NAME + ' has no name or xname field.';
    }

    if (!task.url) return consts.HUXLEYFILE_NAME + ' has no url.';
  }

  return null;
}

function _verifyHuxleyfileContent(content) {
  if (!Array.isArray(content)) {
    return consts.HUXLEYFILE_NAME + ' should be an array.';
  }

  if (content.length === 0) return 'Empty ' + consts.HUXLEYFILE_NAME;

  return _verifyTasks(content);
}

module.exports = createHuxleyfileInfo;
