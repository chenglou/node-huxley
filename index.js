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
// operation(singleTaskObj, callback)
function _operateOnEachTask(operation) {
  var tasks;
  try {
    tasks = require(process.cwd() + '/Huxleyfile.json');
  } catch (err) {
    console.error('No Huxleyfile.json found!'.red);
    return;
  }

  var currentTaskCount = 0;

  operation(tasks[currentTaskCount], function runNextTask(err) {
    if (err) return console.error(err.red);

    if (currentTaskCount === tasks.length - 1) {
      process.stdin.pause();
      console.log('\nAll done successfully!'.green);
    } else {
      console.log('\nNext task...\n');
      operation(tasks[++currentTaskCount], runNextTask);
    }
  });
}

function _recordTask(task, next) {
  var driver = browser.getNewDriver();
  var screenSize = task.screenSize || DEFAULT_SCREEN_SIZE;

  browser.openToUrl(driver, task.url, screenSize[0], screenSize[1], function() {
    console.log('Running test: ' + task.name);
    recorder.start(driver, function(screenShotTimes, recordingStartTime) {
      recorder.stop(driver, screenShotTimes, function(allEvents) {
        var processedTaskEvents =
          _processRawTaskEvents(allEvents, recordingStartTime);

        _saveTaskAsJsonToFolder(task.name, processedTaskEvents, function(err) {
          console.log(
            '\nDon\'t move! Simulating the recording now...\n'.bold.yellow
          );

          browser.quit(driver, function() {
            if (err) return next(err);
            _playbackTaskAndSaveScreenshot(task, function(err) {
              if (err) return next(err);
              next();
            });
          });
        });
      });
    });
  });
}

function _processRawTaskEvents(events, recordingStartTime) {
  // a single task freshly out of a recording session looks like this (first
  // item is time):
  // [1377491482885, 'keypress', 'D']
  // turn it into:
  // {
  //   "action": "keypress",
  //   "offsetTime": 2100,
  //   "key": "D"
  // }
  return events.map(function(event) {
    var action = event[1];
    var obj = {
      action: action,
      offsetTime: event[0] - recordingStartTime,
    };

    switch (action) {
      case 'click':
        obj.pos = event[2];
        break;
      case 'keypress':
        obj.key = event[2];
        break;
      case 'screenshot':
        obj.index = event[2];
        break;
      default:
        throw 'Unrecognized event. This is a fault of the library.'.red;
    }

    return obj;
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

function _playbackTaskAndSaveScreenshot(task, next) {
  _playbackTask(task, false, next);
}

function _playbackTaskAndCompareScreenshot(task, next) {
  _playbackTask(task, true, next);
}

function _playbackTask(task, compareInsteadOfOverride, next) {
  var taskEvents;
  try {
    taskEvents = require(_getTaskFolderName(task.name) + '/record.json');
  } catch (e) {
    console.error('Cannot find info on recorded actions.'.red);
    return;
  }

  var driver = browser.getNewDriver();
  var screenSize = task.screenSize || DEFAULT_SCREEN_SIZE;

  browser.openToUrl(driver, task.url, screenSize[0], screenSize[1], function() {
    console.log('Running test: ' + task.name);

    var options = {
      taskPath: _getTaskFolderName(task.name),
      sleepFactor: task.sleepFactor,
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

function recordTasks() {
  _operateOnEachTask(_recordTask);
}

function playbackTasksAndSaveScreenshots() {
  _operateOnEachTask(_playbackTaskAndSaveScreenshot);
}

function playbackTasksAndCompareScrenshots() {
  _operateOnEachTask(_playbackTaskAndCompareScreenshot);
}

module.exports = {
  recordTasks: recordTasks,
  playbackTasksAndSaveScreenshots: playbackTasksAndSaveScreenshots,
  playbackTasksAndCompareScrenshots: playbackTasksAndCompareScrenshots,
};

// recordTasks();

