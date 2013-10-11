'use strict';

var fs = require('fs');
var browser = require('./source/browser');
var recorder = require('./source/recorder');
var playback = require('./source/playback');
var mkdirp = require('mkdirp');
var colors = require('colors');
var glob = require('glob');

// optimal default screen size. 1200 is bootstrap's definition of 'large screen'
// and 795 is a mba 13inch's available height for firefox window in Selenium.
// The actual height of the chromeless viewport should be 689
var DEFAULT_SCREEN_SIZE = [1200, 795];
// TODO: integration with remote environment

// TODO: following
// Btw, whenever 'path' is mentioned and it concerns a file, the file's name
// itself isn't included

// the signature of the action passed:
// action(browserName, singleTaskObj, callback)
// currently one of:
// `_recordTask`
// `_playbackTaskAndSaveScreenshot`
// `_playbackTaskAndCompareScreenshot`
function _operateOnEachHuxleyfile(browserName, huxleyfilePath, action, next) {
  var tasks;
  try {
    tasks = require(huxleyfilePath + '/' + 'Huxleyfile.json');
  } catch (err) {
    console.log(err);
    return next('Failed to load Huxleyfile in ' + huxleyfilePath + '.');
  }

  // filter out every task that's marked skipped (i.e. has the key `xname`
  // rather than `name`)
  var unSkippedTasks = tasks.filter(function(task) {
    return !task.xname;
  });

  if (tasks.length === 0) {
    return next('No runnable Huxleyfile.json found at ' + huxleyfilePath + '.');
  }

  if (unSkippedTasks.length === 0) {
    console.warn(
      '\nEvery task is marked as skipped at %s.\n'.yellow, huxleyfilePath
    );
    return next();
  }

  var currentTaskCount = 0;

  action(browserName,
        huxleyfilePath,
        unSkippedTasks[currentTaskCount],
        function runNextTask(err) {

    if (err) return next(err);

    if (currentTaskCount === unSkippedTasks.length - 1) {
      var skippedTaskCount = tasks.length - unSkippedTasks.length;
      if (skippedTaskCount > 0) {
        console.log(
          '\nYou\'ve skipped %s task%s at %s\n'.yellow,
          skippedTaskCount,
          skippedTaskCount > 1 ? 's' : '',
          huxleyfilePath
        );
      }
      next();
    } else {
      console.log('\nNext task...\n');
      action(
        browserName,
        huxleyfilePath,
        unSkippedTasks[++currentTaskCount],
        runNextTask
      );
    }
  });
}

function _recordTask(browserName, huxleyfilePath, task, next) {
  var driver = browser.getNewDriver(browserName);
  if (driver == null) return next('Unsupported browser.');

  var screenSize = task.screenSize || DEFAULT_SCREEN_SIZE;

  browser.openToUrl(driver, task.url, screenSize[0], screenSize[1], function() {
    console.log('Running test: %s'.bold, task.name);
    recorder.startPromptAndInjectEventsScript(driver,
                                              function(screenShotTimes) {
      recorder.stopAndGetProcessedEvents(driver,
                                        screenShotTimes,
                                        function(allEvents) {
        _saveTaskAsJsonToFolder(task.name,
                                huxleyfilePath,
                                allEvents,
                                function(err) {
          console.log(
            '\nDon\'t move! Simulating the recording now...\n'.yellow
          );

          browser.quit(driver, function() {
            if (err) return next(err);
            _playbackTaskAndSaveScreenshot(browserName,
                                          huxleyfilePath,
                                          task,
                                          function(err) {
              if (err) return next(err);
              next();
            });
          });
        });
      });
    });
  });
}

function _saveTaskAsJsonToFolder(taskName, huxleyfilePath, taskEvents, next) {
  // `taskEvents` should already have been processed by `_processRawTaskEvents`
  var folderPath = huxleyfilePath + '/' + taskName + '.hux';
  mkdirp(folderPath, function(err) {
    if (err) return next(err);
    fs.writeFile(folderPath + '/record.json',
                JSON.stringify(taskEvents, null, 2), // prettify, 2-space indent
                function(err) {
      if (err) return next(err);
      next();
    });
  });
}

function _playbackTaskAndSaveScreenshot(browserName,
                                        huxleyfilePath,
                                        task,
                                        next) {
  _playbackTask(browserName, huxleyfilePath,task, false, next);
}

function _playbackTaskAndCompareScreenshot(browserName,
                                          huxleyfilePath,
                                          task,
                                          next) {
  _playbackTask(browserName, huxleyfilePath,task, true, next);
}

function _playbackTask(browserName,
                      huxleyfilePath,
                      task,
                      compareInsteadOfOverride,
                      next) {
  var taskEvents;
  var recordPath = huxleyfilePath + '/' + task.name + '.hux';

  try {
    taskEvents = require(recordPath + '/record.json');
  } catch (err) {
    return next('Cannot find enough info on recorded actions.');
  }

  var driver = browser.getNewDriver(browserName);
  if (driver === null) return next('Unsupported browser.');

  var screenSize = task.screenSize || DEFAULT_SCREEN_SIZE;

  browser.openToUrl(driver, task.url, screenSize[0], screenSize[1], function() {
    console.log('\nRunning test: %s\n', task.name);

    var options = {
      taskPath: recordPath,
      compareWithOld: compareInsteadOfOverride
    };
    playback(driver, taskEvents, options, function(err) {
      browser.quit(driver, function() {
        if (err) return next(err);
        next();
      });
    });
  });
}

// the path doesn't include the name `Huxleyfile.json`
function _operateOnAllHuxleyfiles(browserName, huxleyfilePaths, action) {
  if (!huxleyfilePaths.length) {
    huxleyfilePaths = ['**/'];
  }

  // this is beautiful
  var allHuxleyPaths = Object.keys(huxleyfilePaths
    .map(function(path) {
    // use glob to find every huxleyfile in the path, including nested ones.
    // Normally we'd do a simple exec('find blabla'), but this wouldn't work on
    // Windows. So search every huxleyfile location
      return glob.sync(process.cwd() + '/' + path + '/Huxleyfile.json');
    })
    .reduce(function(path1, path2) {
      // flatten into a one-level array while eliminating empty path
      return path1.concat(path2);
    })
    .map(function(path) {
      // trim the file name to get the container folders, needed for storing
      // screenshots and such
      return path.substr(0, path.lastIndexOf('/'));
    })
    .reduce(function(obj, path) {
      // turn into object to eliminate duplicate paths
      obj[path] = true;
      return obj;
    }, {}));

  if (allHuxleyPaths.length === 0) {
    return console.error('No Huxleyfile.json found anywhere.'.red);
  }

  var currentHuxleyfileIndex = 0;
  _operateOnEachHuxleyfile(browserName,
                          allHuxleyPaths[currentHuxleyfileIndex],
                          action,
                          function runNextHuxleyfile(err) {
    if (err) {
      process.stdin.pause();
      console.error(typeof err === 'string' ? err.red : err.message.red);
      console.error(
        '\nThe tests now halts. You might have unfinished tasks.'.red
      );
      return;
    }
    if (currentHuxleyfileIndex === allHuxleyPaths.length - 1) {
      process.stdin.pause();
      console.log('\nAll done successfully!\n'.green);
    } else {
      currentHuxleyfileIndex++;
      _operateOnEachHuxleyfile(
        browserName,
        allHuxleyPaths[currentHuxleyfileIndex],
        action,
        runNextHuxleyfile
      );
    }
  });
}

function recordTasks(browserName, huxleyfilePath) {
  _operateOnAllHuxleyfiles(browserName, huxleyfilePath, _recordTask);
}

function playbackTasksAndSaveScreenshots(browserName, huxleyfilePath) {
  _operateOnAllHuxleyfiles(
    browserName, huxleyfilePath, _playbackTaskAndSaveScreenshot
  );
}

function playbackTasksAndCompareScrenshots(browserName, huxleyfilePath) {
  _operateOnAllHuxleyfiles(
    browserName, huxleyfilePath, _playbackTaskAndCompareScreenshot
  );
}

module.exports = {
  recordTasks: recordTasks,
  playbackTasksAndSaveScreenshots: playbackTasksAndSaveScreenshots,
  playbackTasksAndCompareScrenshots: playbackTasksAndCompareScrenshots,
};
