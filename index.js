'use strict';

var fs = require('fs');
var browser = require('./source/browser');
var recorder = require('./source/recorder');
var playback = require('./source/playback');
var mkdirp = require('mkdirp');
var colors = require('colors');

var DEFAULT_SCREEN_SIZE = [1024, 768];
// TODO: integration with remote environment
var currentPath = process.cwd();

function _getTaskFolderName(taskName) {
  return currentPath + '/' + taskName + '.hux';
}

// the signature of the operation passed:
// operation(browserName, singleTaskObj, callback)
function _operateOnEachTask(browserName, operation) {
  var tasks;
  try {
    tasks = require(currentPath + '/Huxleyfile.json');
  } catch (err) {
    console.error('No runnable Huxleyfile.json found at %s.'.red, currentPath);
    return;
  }

  // filter out every task that's marked skipped (i.e. has the key `xname`
  // rather than `name`)
  var unSkippedTasks = tasks.filter(function(task) {
    return !task.xname;
  });

  if (tasks.length === 0) {
    return console.error('No runnable task found at %s.'.red, currentPath);
  }

  if (unSkippedTasks.length === 0) {
    console.error('Every task is marked as skipped at %s.'.yellow, currentPath);
    return;
  }

  var currentTaskCount = 0;

  operation(browserName,
            unSkippedTasks[currentTaskCount],
            function runNextTask(err) {
    if (err) {
      process.stdin.pause();
      return console.error(typeof err === 'string' ? err.red : err.message.red);
    }

    if (currentTaskCount === unSkippedTasks.length - 1) {
      process.stdin.pause();
      console.log('\nAll done successfully!'.green);
      var skippedTaskCount = tasks.length - unSkippedTasks.length;
      if (skippedTaskCount > 0) {
        console.log(
          '\nYou\'ve skipped %s task%s at %s'.yellow,
          skippedTaskCount,
          skippedTaskCount > 1 ? 's' : '',
          currentPath
        );
      }
    } else {
      console.log('\nNext task...\n');
      operation(browserName, unSkippedTasks[++currentTaskCount], runNextTask);
    }
  });
}

function _recordTask(browserName, task, next) {
  var driver = browser.getNewDriver(browserName);
  if (driver == null) return next('Unsupported browser.');

  var screenSize = task.screenSize || DEFAULT_SCREEN_SIZE;

  browser.openToUrl(driver, task.url, screenSize[0], screenSize[1], function() {
    console.log('Running test: ' + task.name);
    recorder.startPromptAndInjectEventsScript(driver,
                                              function(screenShotTimes) {
      recorder.stopAndGetProcessedEvents(driver,
                                        screenShotTimes,
                                        function(allEvents) {
        _saveTaskAsJsonToFolder(task.name, allEvents, function(err) {
          console.log(
            '\nDon\'t move! Simulating the recording now...\n'.bold.yellow
          );

          browser.quit(driver, function() {
            if (err) return next(err);
            _playbackTaskAndSaveScreenshot(browserName, task, function(err) {
              if (err) return next(err);
              next();
            });
          });
        });
      });
    });
  });
}

function _saveTaskAsJsonToFolder(taskName, taskEvents, next) {
  // `taskEvents` should already have been processed by `_processRawTaskEvents`
  var folderPath = _getTaskFolderName(taskName);
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

function _playbackTaskAndSaveScreenshot(browserName, task, next) {
  _playbackTask(browserName, task, false, next);
}

function _playbackTaskAndCompareScreenshot(browserName, task, next) {
  _playbackTask(browserName, task, true, next);
}

function _playbackTask(browserName, task, compareInsteadOfOverride, next) {
  var taskEvents;
  try {
    taskEvents = require(_getTaskFolderName(task.name) + '/record.json');
  } catch (e) {
    return next('Cannot find enough info on recorded actions.');
  }

  var driver = browser.getNewDriver(browserName);
  if (driver === null) return next('Unsupported browser.');

  var screenSize = task.screenSize || DEFAULT_SCREEN_SIZE;

  browser.openToUrl(driver, task.url, screenSize[0], screenSize[1], function() {
    console.log('Running test: ' + task.name);

    var options = {
      taskPath: _getTaskFolderName(task.name),
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

function recordTasks(browserName) {
  _operateOnEachTask(browserName, _recordTask);
}

function playbackTasksAndSaveScreenshots(browserName) {
  _operateOnEachTask(browserName, _playbackTaskAndSaveScreenshot);
}

function playbackTasksAndCompareScrenshots(browserName) {
  _operateOnEachTask(browserName, _playbackTaskAndCompareScreenshot);
}

module.exports = {
  recordTasks: recordTasks,
  playbackTasksAndSaveScreenshots: playbackTasksAndSaveScreenshots,
  playbackTasksAndCompareScrenshots: playbackTasksAndCompareScrenshots,
};

// recordTasks();

