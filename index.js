'use strict';

var fs = require('fs');
var browser = require('./browser');
var recorder = require('./recorder');
var playback = require('./playback');
var mkdirp = require('mkdirp');
var colors = require('colors');

var DEFAULT_SCREEN_SIZE = [1024, 768];
// TODO: integration with remote environment


function _getTaskFolderName(taskName) {
  return process.cwd() + '/' + taskName + '.huxley';
}

// the signature of the operation passed:
// operation(browserName, singleTaskObj, callback)
function _operateOnEachTask(browserName, operation) {
  var tasks;
  try {
    tasks = require(process.cwd() + '/Huxleyfile.json');
  } catch (err) {
    console.error('No Huxleyfile.json found!'.red);
    return;
  }

  var currentTaskCount = 0;

  operation(browserName, tasks[currentTaskCount], function runNextTask(err) {
    if (err) {
      process.stdin.pause();
      return console.error(err.red);
    }

    if (currentTaskCount === tasks.length - 1) {
      process.stdin.pause();
      console.log('\nAll done successfully!'.green);
    } else {
      console.log('\nNext task...\n');
      operation(browserName, tasks[++currentTaskCount], runNextTask);
    }
  });
}

function _recordTask(browserName, task, next) {
  var driver = browser.getNewDriver(browserName);
  if (driver == null) return next('Unsupported browser.');

  var screenSize = task.screenSize || DEFAULT_SCREEN_SIZE;

  browser.openToUrl(driver, task.url, screenSize[0], screenSize[1], function() {
    console.log('Running test: ' + task.name);
    // TODO: gutter
    recorder.startPromptAndInjectEventsScript(driver, function(screenShotTimes, recordingStartTime) {
      recorder.stopAndGetProcessedEvents(driver, screenShotTimes, recordingStartTime, function(allEvents) {
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
                JSON.stringify(taskEvents, null, 2), // prettify, 2 spaces indent
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
    return next('Cannot find info on recorded actions.');
  }

  var driver = browser.getNewDriver(browserName);
  if (driver === null) return next('Unsupported browser.');

  var screenSize = task.screenSize || DEFAULT_SCREEN_SIZE;

  browser.openToUrl(driver, task.url, screenSize[0], screenSize[1], function() {
    console.log('Running test: ' + task.name);

    var options = {
      taskPath: _getTaskFolderName(task.name),
      compareWithOldImages: compareInsteadOfOverride
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

