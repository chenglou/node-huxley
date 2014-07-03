'use strict';

var colors = require('colors');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

var browser = require('./source/browser/driver');
var consts = require('./source/constants');
var defaultDoneCallback = require('./source/defaultDoneCallback');
var playback = require('./source/playback');
var record = require('./source/record');
var getPlaybackInfos = require('./source/playback/getPlaybackInfos');

var runtimeConfig = require('./source/runtimeConfig');

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

    // prettify, 2-space indent json + line feed
    fs.writeFile(
      path.join(recordPath, consts.RECORD_FILE_NAME),
      JSON.stringify(taskEvents, null, 2) + '\n',
      next
    );
  });
}

function _recordAndSave(playbackInfo, next) {
  record(runtimeConfig.config.driver, function(err, allEvents) {
    _saveTaskAsJsonToFolder(playbackInfo.recordPath, allEvents, next);
  });
}

function _runEachPlayback(playbackInfos, action, next) {
  var currentIndex = 0;

  _runActionOrDisplaySkipMsg(
    playbackInfos[currentIndex],
    action,
    function _next(err) {
      if (err) return next(err);

      if (currentIndex === playbackInfos.length - 1) return next();

      _runActionOrDisplaySkipMsg(playbackInfos[++currentIndex], action, _next);
    }
  );
}

// does nothing but open and close the browser and handle its errors
// needs to know nothing but a command to run in-between, and the callback
function _openRunAndClose(playbackInfos, openDummy, action, next) {
  // playbackInfos all have the same browserName. Arbitrarily choose the first
  var browserName = runtimeConfig.config.browserName;
  var serverUrl = runtimeConfig.config.serverUrl;

  browser.open(browserName, serverUrl, function(err, driver) {
    if (err) {
      if (driver == null) return next(err);

      return browser.quit(driver, function(err2) {
        next(err || err2 || null);
      });
    }

    runtimeConfig.config.driver = driver;

    if (openDummy) {
      // TODO: pass a config obj instead.
      return browser.openDummy(browserName, serverUrl, function(err, dummyDriver) {
        process.on('SIGINT', function() {
          browser.quit(driver, function() {
            browser.quit(dummyDriver, process.exit);
          });
        });
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
    } else {
      process.on('SIGINT', function() {
        browser.quit(driver, process.exit);
      });
      action(function(err) {
        browser.quit(driver, function(err2) {
          next(err || err2 || null);
        });
      });
    }
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

  var browserChromeWidth;
  var browserChromeHeight;
  if (runtimeConfig.config.browserName === 'firefox') {
    // for FF, one place where quirks show up is when (page scrolls to the
    // bottom && browser exceeds max monitor screen size): say, for height,
    // viewport ~600, screenSize 700, scrollY 1000, page height 1600. If we
    // naively cut at scrollY til bottom, we don't get the 700 we want. This is
    // fixed in playback @ _simulateScreenshot, for config top/left
    browserChromeWidth = consts.FIREFOX_CHROME_SIZE[0];
    browserChromeHeight = consts.FIREFOX_CHROME_SIZE[1];
  } else {
    // assume Chrome
    browserChromeWidth = consts.CHROME_CHROME_SIZE[0];
    browserChromeHeight = consts.CHROME_CHROME_SIZE[1];
  }


  browser.goToUrl(
    runtimeConfig.config.driver,
    playbackInfo.url,
    playbackInfo.screenSize[0] + browserChromeWidth,
    playbackInfo.screenSize[1] + browserChromeHeight,
    function(err) {
      action(playbackInfo, next);
    }
  );
}

function _recordTasks(browserName, serverUrl, globs, next) {
  _getRunnableRecords(globs, false, function(err, playbackInfos) {
    if (err) return next(err);

    _openRunAndClose(
      playbackInfos,
      false,
      _runEachPlayback.bind(null, playbackInfos, _recordAndSave),
      next
    );
  });
}

// where `x` is either compare or update screenshot
function _playbackTasksAndXScreenshots(globs, next) {
  _getRunnableRecords(globs, true, function(err, playbackInfos) {
    if (err) return next(err);

    _openRunAndClose(
      playbackInfos,
      false,
      _runEachPlayback.bind(null, playbackInfos, playback),
      next
    );
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

function recordTasks(browserName, serverUrl, globs, next) {
  runtimeConfig.config = {
    browserName: browserName || 'firefox',
    serverUrl: serverUrl,
    mode: consts.MODE_RECORD
  };

  _recordTasks(browserName, serverUrl, globs, function(err) {
    if (err) return next(err);

    console.log('\nDon\'t move! Simulating the recording now...'.yellow);
    playbackTasksAndSaveScreenshots(browserName, serverUrl, globs, next);
  });
}

function playbackTasksAndCompareScreenshots(browserName, serverUrl, globs, next) {
  runtimeConfig.config = {
    browserName: browserName || 'firefox',
    serverUrl: serverUrl,
    mode: consts.MODE_COMPARE
  };

  _playbackTasksAndXScreenshots(globs, next);
}
function playbackTasksAndSaveScreenshots(browserName, serverUrl, globs, next) {
  runtimeConfig.config = {
    browserName: browserName || 'firefox',
    serverUrl: serverUrl,
    mode: consts.MODE_UPDATE
  };

  _playbackTasksAndXScreenshots(globs, next);
}

module.exports = {
  injectDriver: browser.injectDriver,
  recordTasks: recordTasks,
  playbackTasksAndSaveScreenshots: playbackTasksAndSaveScreenshots,
  playbackTasksAndCompareScreenshots: playbackTasksAndCompareScreenshots,
  defaultDoneCallback: defaultDoneCallback
};
