// TODO: better display msgs
var fs = require('fs');
var browser = require('./browser');
var recorder = require('./recorder');
var replayer = require('./replayer');
var mkdirp = require('mkdirp');

var rerunActionsMessage =
  'Up next, we\'ll re-run your actions to generate screenshots to ensure they' +
  ' are pixel-perfect when running automated. Press enter to start.';

var playingBackMessage = 'Playing back to ensure the test is correct.';

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
    // TODO: colorify! and maybe not console
    console.error('No Huxleyfile.json found!');
    return;
  }

  // TODO: error if no huxfile, throw if no task
  var currentTaskCount = 0;

  operation(tasks[currentTaskCount], function runNextTask() {
    if (currentTaskCount === tasks.length - 1) {
      process.stdin.pause();
      console.log('done');
    } else {
      console.log('next task...');
      operation(tasks[++currentTaskCount], runNextTask);
    }
  });
}

function recordTasks() {
  _operateOnEachTask(_recordTask);
}

function updateTasks() {
  _operateOnEachTask(_updateTask);
}

function playbackTasks() {
  _operateOnEachTask(_playbackTask);
}

function _recordTask(task, callback) {
  var driver = browser.buildAndReturnNewDriver();
  // TODO: put in a constant file
  var screenSize = task.screenSize || [1024, 768];

  browser.openToUrl(driver, task.url, screenSize[0], screenSize[1], function() {
    console.log('Running test: ' + task.name);
    recorder.start(driver, function(screenShotTimes, recordingStartTime) {
      recorder.stop(driver, screenShotTimes, function(allEvents) {
        var processedTaskEvents = _processRawTaskEvents(allEvents, recordingStartTime);

        _saveTaskAsJsonToFolder(task.name, processedTaskEvents, function() {
          browser.refresh(driver, function() {
            replayer.simulateEvents(driver, processedTaskEvents, {taskDir: _getTaskFolderName(task.name), sleepFactor: task.sleepFactor}, function() {
              browser.quit(driver, function() {
                callback();
              });
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
  // [1377491482885, 'keyup', 'D']
  // turn it into:
  // {
  //   "action": "keyup",
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
      case 'keyup':
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
    // TODO: prettify
    fs.writeFile(folderPath + '/record.json', JSON.stringify(taskSteps), function(err) {
      // TODO: err
      callback();
    });
  });
}

// TODO: callback -> done
function _updateTask(task, callback) {
  var userEvents;
  try {
    userEvents = require(_getTaskFolderName(task.name) + '/record.json');
  } catch (e) {
    console.error('Cannot find info on recorded actions.');
    return;
  }

  var driver = browser.buildAndReturnNewDriver();
  // TODO: put in a constant file
  var screenSize = task.screenSize || [1024, 768];

  browser.openToUrl(driver, task.url, screenSize[0], screenSize[1], function() {
    console.log('Running test: ' + task.name);
    // TODO: concurrency issue somewhere. Set sleepFactor small crashes selenium
    replayer.simulateEvents(driver, userEvents, {taskDir: _getTaskFolderName(task.name), sleepFactor: task.sleepFactor}, function() {
      browser.quit(driver, function() {
        callback();
      });
    });
  });
}

function _playbackTask(task, callback) {
  var userEvents;
  try {
    userEvents = require(_getTaskFolderName(task.name) + '/record.json');
  } catch (e) {
    console.error('Cannot find info on recorded actions.');
    return;
  }

  var driver = browser.buildAndReturnNewDriver();
  // TODO: put in a constant file
  var screenSize = task.screenSize || [1024, 768];

  browser.openToUrl(driver, task.url, screenSize[0], screenSize[1], function() {
    console.log('Running test: ' + task.name);
    // TODO: concurrency issue somewhere. Set sleepFactor small crashes selenium
    replayer.simulateEvents(driver, userEvents, {taskDir: _getTaskFolderName(task.name), sleepFactor: task.sleepFactor, compareWithOldImages: true}, function() {
      browser.quit(driver, function() {
        callback();
      });
    });
  });

}

module.exports = {
  recordTasks: recordTasks,
  updateTasks: updateTasks,
  playbackTasks: playbackTasks,
};

// recordTasks();

