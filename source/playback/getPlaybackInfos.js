'use strict';

var glob = require('glob');
var path = require('path');

var consts = require('../constants');
var createValidPlaybackInfo = require('./createValidPlaybackInfo');
var createValidHuxleyfileInfo = require('./createValidHuxleyfileInfo');

// the path doesn't include the name `Huxleyfile.json`
function _getAllHuxleyfilesPaths(globs) {
  return Object.keys(globs
    .map(function(path1) {
      // use glob to find every huxleyfile in the path, including nested ones.
      // Normally we'd do a simple exec('find blabla'), but this wouldn't work
      // on Windows. So search every huxleyfile location
      return glob.sync(path.join(path.resolve(path1), consts.HUXLEYFILE_NAME));
    })
    .reduce(function(path1, path2) {
      // flatten into a one-level array while eliminating empty path
      return path1.concat(path2);
    })
    .map(function(path1) {
      // get the container folders, needed for storing
      // screenshots and such
      return path.dirname(path1);
    })
    .reduce(function(obj, path) {
      // turn into object to eliminate duplicate paths
      obj[path] = true;
      return obj;
    }, {}));
}

function _getHuxleyfileInfos(globs, next) {
  var allPaths = _getAllHuxleyfilesPaths(globs);
  if (!allPaths.length) return next('No huxleyfile found anywhere.');

  var returnFiles = [];

  for (var i = 0; i < allPaths.length; i++) {
    var huxleyfile;
    var currentPath = allPaths[i];
    var relativeCurrentPath = path.relative(process.cwd(), currentPath);
    try {
      huxleyfile = require(path.join(currentPath, consts.HUXLEYFILE_NAME));
    } catch (err) {
      return next(
        relativeCurrentPath + ': Failed to read ' + consts.HUXLEYFILE_NAME
      );
    }

    var huxleyfileInfo = createValidHuxleyfileInfo({
      huxleyfileContent: huxleyfile,
      path: currentPath
    });
    // err message
    if (typeof huxleyfileInfo === 'string') {
      return next(relativeCurrentPath + ': ' + huxleyfileInfo);
    }

    returnFiles.push(huxleyfileInfo);
  }

  next(null, returnFiles);
}

function getPlaybackInfos(globs, loadRecords, next) {
  _getHuxleyfileInfos(globs, function(err, huxleyfileInfos) {
    if (err) return next(err);

    var playbackInfos = [];

    for (var i = 0; i < huxleyfileInfos.length; i++) {
      var huxleyfileInfo =  huxleyfileInfos[i];
      var huxleyfilePath = huxleyfileInfo.path;

      for (var j = 0; j < huxleyfileInfo.huxleyfileContent.length; j++) {
        var task = huxleyfileInfo.huxleyfileContent[j];
        var taskName = task.name != null ? task.name : task.xname;
        var recordPath = path.join(huxleyfilePath, taskName +
            consts.SCREENSHOTS_FOLDER_EXT);

        var playbackInfoParams = {
          recordPath: recordPath,
          screenSize: task.screenSize,
          url: task.url
        };

        var playbackInfo;
        var isSkipped = task.xname != null;
        var relativeCurrentPath = path.relative(process.cwd(), recordPath);
        if (isSkipped || !loadRecords) {
          playbackInfoParams.isSkipped = isSkipped;
          playbackInfo = createValidPlaybackInfo(playbackInfoParams, false);
          // error msg
          if (typeof playbackInfo === 'string') {
            return next(relativeCurrentPath + ': ' + playbackInfo);
          }

          playbackInfos.push(playbackInfo);
          continue;
        }

        var record;
        try {
          record = require(path.join(recordPath, consts.RECORD_FILE_NAME));
        } catch (err) {
          return next(relativeCurrentPath + ': Failed to read record.');
        }

        playbackInfoParams.recordContent = record;
        playbackInfo = createValidPlaybackInfo(playbackInfoParams, true);
        // error msg
        if (typeof playbackInfo === 'string') {
          return next(relativeCurrentPath + ': ' + playbackInfo);
        }
        playbackInfos.push(playbackInfo);
      }
    }
    next(null, playbackInfos);
  });
}

module.exports = getPlaybackInfos;
