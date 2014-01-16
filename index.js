'use strict';

var colors = require('colors');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

var browser = require('./source/browser');
var consts = require('./source/constants');
var playback = require('./source/playback');
var record = require('./source/record');
var getPlaybackInfos = require('./source/getPlaybackInfos');

// TODO: integration with remote environment

// whenever 'path' is mentioned and it concerns a file, the file's name itself
// isn't included

// flow:

// recordTasks:

// _recordTasks -> getPlaybackInfos -> _openRunAndClose -> _runEachPlayback ->
// _runActionOrDisplaySkipMsg -> _recordAndSave -> record ->
// _saveTaskAsJsonToFolder -> _runActionOrDisplaySkipMsg

// playbackTasksAndCompareScreenshots:

// _playbackTasksAndXScreenshots -> getPlaybackInfos -> _openRunAndClose ->
// _runEachPlayback -> _runActionOrDisplaySkipMsg -> playback ->
// _runActionOrDisplaySkipMsg

function _saveTaskAsJsonToFolder(recordPath, taskEvents, next) {
  mkdirp(recordPath, function(err) {
    if (err) return next(err);

    fs.writeFile(path.join(recordPath, consts.RECORD_FILE_NAME),
                JSON.stringify(taskEvents, null, 2), // prettify, 2-space indent
                next);
  });
}

function _recordAndSave(playbackInfo, next) {
  record(playbackInfo.driver, function(err, allEvents) {
    _saveTaskAsJsonToFolder(playbackInfo.recordPath, allEvents, next);
  });
}

function _runEachPlayback(playbackInfos, action, next) {
  var currentIndex = 0;

  _runActionOrDisplaySkipMsg(playbackInfos[currentIndex],
                            action,
                            function _next(err) {
    if (err) return next(err);

    if (currentIndex === playbackInfos.length - 1) return next();

    _runActionOrDisplaySkipMsg(playbackInfos[++currentIndex], action, _next);
  });
}

// does nothing but open and close the browser and handle its errors
// needs to know nothing but a command to run in-between, and the callback
function _openRunAndClose(playbackInfos, openDummy, action, next) {
  // playbackInfos all have the same browserName. Arbitrarily choose the first
  var browserName = playbackInfos[0].browserName;
  browser.open(browserName, function(err, driver) {
    if (err) {
      if (driver == null) return next(err);

      return browser.quit(driver, function(err2) {
        next(err || err2 || null);
      });
    }

    playbackInfos.forEach(function(info) {
      info.driver = driver;
    });

    if (openDummy) {
      return browser.openDummy(browserName, function(err, dummyDriver) {
        if (err) {
          return browser.quit(dummyDriver, function(err2) {
            next(err || err2 || null);
          });
        }

        action(function(err) {
          browser.quit(driver, function(err2) {
            browser.quit(dummyDriver, function(err3) {
              next(err || err2 || err3 || null);
            });
          });
        });
      });
    }

    action(function(err) {
      browser.quit(driver, function(err2) {
        next(err || err2 || null);
      });
    });
  });
}

function _runActionOrDisplaySkipMsg(playbackInfo, action, next) {
  console.log(
    '\nAt %s'.underline, path.relative(process.cwd(), playbackInfo.recordPath)
  );

  if (playbackInfo.isSkipped) {
    console.log('Marked as skipped.');
    return next();
  }

  browser.goToUrl(playbackInfo.driver,
                  playbackInfo.url,
                  playbackInfo.screenSize[0],
                  playbackInfo.screenSize[1],
                  function(err) {
    action(playbackInfo, next);
  });
}

function _recordTasks(browserName, globs, next) {
  _getRunnableRecords(globs, false, function(err, playbackInfos) {
    if (err) return next(err);

    playbackInfos.forEach(function(info) {
      info.browserName = browserName;
    });
    _openRunAndClose(playbackInfos,
                    false,
                    _runEachPlayback.bind(null, playbackInfos, _recordAndSave),
                    next);
  });
}

// where `x` is either compare or update screenshot
function _playbackTasksAndXScreenshots(browserName,
                                      globs,
                                      saveInsteadOfCompare,
                                      next) {
  _getRunnableRecords(globs, true, function(err, playbackInfos) {
    if (err) return next(err);

    playbackInfos.forEach(function(info) {
      info.browserName = browserName;
      info.overrideScreenshots = saveInsteadOfCompare;
    });
    _openRunAndClose(playbackInfos,
                    true,
                    _runEachPlayback.bind(null, playbackInfos, playback),
                    next);
  });
}

function _getRunnableRecords(globs, loadRecords, next) {
  if (!globs.length) globs = ['**/'];

  getPlaybackInfos(globs, loadRecords, function(err, playbackInfos) {
    if (err) return next(err);

    var hasRunnableRecords = playbackInfos.some(function(info) {
      return !info.isSkipped;
    });
    if (!hasRunnableRecords) {
      return next('Every task is marked as skipped.');
    }

    next(null, playbackInfos);
  });
}

function recordTasks(browserName, globs, next) {
  _recordTasks(browserName, globs, function(err) {
    if (err) return next(err);

    console.log('\nDon\'t move! Simulating the recording now...'.yellow);
    playbackTasksAndSaveScreenshots(browserName, globs, next);
  });
}

function playbackTasksAndCompareScreenshots(browserName, globs, next) {
  _playbackTasksAndXScreenshots(browserName, globs, false, next);
}
function playbackTasksAndSaveScreenshots(browserName, globs, next) {
  _playbackTasksAndXScreenshots(browserName, globs, true, next);
}

function defaultDoneCallback(err) {
  if (err) {
    console.error(typeof err === 'string' ? err.red : err.message.red);
    console.error('\nThe tests now halt. You might have unfinished tasks.'.red);
  } else {
    console.log('\nAll done successfully!'.green);
  }
}

module.exports = {
  recordTasks: recordTasks,
  playbackTasksAndSaveScreenshots: playbackTasksAndSaveScreenshots,
  playbackTasksAndCompareScreenshots: playbackTasksAndCompareScreenshots,
  // third-party's (e.g. grunt-huxley) entrance point. See bin/hux
  defaultDoneCallback: defaultDoneCallback
};
