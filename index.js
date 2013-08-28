// TODO: better display msgs
var fs = require('fs');
var browser = require('./browser');
var recorder = require('./recorder');
var playback = require('./playback');
var mkdirp = require('mkdirp');
var colors = require('colors');

// TODO: integration with remote environment


function _getTaskFolderName(taskName) {
  return process.cwd() + '/' + taskName + '.huxley';
}

// the signature of the operation passed:
// operation(singleTaskObj, callback)
// TODO: what does task/event/recording really mean?
function _operateOnEachTask(operation) {
  var tasks;
  try {
    tasks = require(process.cwd() + '/Huxleyfile.json');
  } catch (e) {
    // TODO: maybe not console
    console.error('No Huxleyfile.json found!'.red);
    return;
  }

  // TODO: throw if no task
  var currentTaskCount = 0;

  operation(tasks[currentTaskCount], function runNextTask() {
    if (currentTaskCount === tasks.length - 1) {
      process.stdin.pause();
      // TODO: better msg
      console.log('All done successfully!'.green);
    } else {
      console.log('\nnext task...');
      operation(tasks[++currentTaskCount], runNextTask);
    }
  });
}

function _recordTask(task, next) {
  var driver = browser.getNewDriver();
  // TODO: put in a constant file
  var screenSize = task.screenSize || [1024, 768];

  browser.openToUrl(driver, task.url, screenSize[0], screenSize[1], function() {
    console.log('Running test: ' + task.name);
    recorder.start(driver, function(screenShotTimes, recordingStartTime) {
      recorder.stop(driver, screenShotTimes, function(allEvents) {
        var processedTaskEvents = _processRawTaskEvents(allEvents, recordingStartTime);
        _saveTaskAsJsonToFolder(task.name, processedTaskEvents, function() {
          console.log('\nDon\'t move! Simulating the recording now...\n'.bold.yellow);
          browser.quit(driver, function() {
            _playbackTaskAndSaveScreenshot(task, function() {
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
        // TODO: really throw?
        throw 'Unrecognized user event.';
    }

    return obj;
  });
}

function _saveTaskAsJsonToFolder(taskName, taskSteps, callback) {
  // `taskSteps` should already have been processed by `_processRawTaskEvents`
  var folderPath = _getTaskFolderName(taskName);
  // TODO: err
  mkdirp(folderPath, function(err) {
    fs.writeFile(folderPath + '/record.json',
                JSON.stringify(taskSteps, null, 2), // prettify, 2 spaces indent
                function(err) {
      // TODO: err
      callback();
    });
  });
}

// TODO: callback -> done
function _playbackTaskAndSaveScreenshot(task, callback) {
  var userEvents;
  try {
    userEvents = require(_getTaskFolderName(task.name) + '/record.json');
  } catch (e) {
    console.error('Cannot find info on recorded actions.');
    return;
  }

  var driver = browser.getNewDriver();
  // TODO: put in a constant file
  var screenSize = task.screenSize || [1024, 768];

  browser.openToUrl(driver, task.url, screenSize[0], screenSize[1], function() {
    console.log('Running test: ' + task.name);
    // TODO: concurrency issue somewhere. Set sleepFactor small crashes selenium
    playback(driver, userEvents, {taskDir: _getTaskFolderName(task.name), sleepFactor: task.sleepFactor}, function() {
      browser.quit(driver, function() {
        callback();
      });
    });
  });
}

function _playbackTaskAndCompareScreenshot(task, callback) {
  var userEvents;
  try {
    userEvents = require(_getTaskFolderName(task.name) + '/record.json');
  } catch (e) {
    console.error('Cannot find info on recorded actions.'.red);
    return;
  }

  var driver = browser.getNewDriver();
  // TODO: put in a constant file
  var screenSize = task.screenSize || [1024, 768];

  browser.openToUrl(driver, task.url, screenSize[0], screenSize[1], function() {
    console.log('Running test: ' + task.name);
    // TODO: concurrency issue somewhere. Set sleepFactor small crashes selenium
    playback(driver, userEvents, {taskDir: _getTaskFolderName(task.name), sleepFactor: task.sleepFactor, compareWithOldImages: true}, function() {
      browser.quit(driver, function() {
        callback();
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

