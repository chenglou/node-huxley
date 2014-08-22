var Promise = require('bluebird');

var compareScreenshots = require('../replay/compareScreenshots');
var consts = require('../constants');
var execP = require('../promisified/execP');
var runTasks = require('../runTasks');
var getUnchanged = require('./getUnchanged');
var gitCmds = require('./gitCmds');
var path = require('path');
var writeScreenshots = require('../replay/writeScreenshots');
var filterRunnables = require('../fileOps/filterRunnables');
var removeDirIfOk = require('./removeDirIfOk');

var notGitMsg =
  'The default huxley workflow assumes the current folder uses git. This is what it does:\n' +
  '- store away the current unsaved changes\n' +
  '- record screenshots on the fresh, pre-change code, using that as the reference point\n' +
  '- restore the unsaved changes\n' +
  '- record the screenshots on the post-change code\n' +
  '- compare them to the previously recorded ones to make sure everything looks the same\n';

// will support hg in the future
function defaultWorkflow(opts) {
  var tasks;
  var paths;
  var runnableTasks;
  var runnablePaths;

  return execP('git status')
    .spread(function(stdout, stderr) {
      var errMsg;
      if (stderr !== '') {
        errMsg = stderr.indexOf('Not a git repository') > -1 ?
          notGitMsg :
          stderr;

        return Promise.reject(new Error(errMsg + '\n'));
      }

      return getUnchanged(opts.globs);
    })
    .spread(function(a, b) {
      tasks = a;
      paths = b;
      console.log(
        'Repo reverted to clean state. Looking at previous screenshots...\n'
      );
      return gitCmds.safeStashAll();
    })
    .then(function() {
      // TODO: not good enough. Warn earlier about no task. Before stash
      var res = filterRunnables(tasks, paths, opts.taskName);
      runnableTasks = res[0];
      runnablePaths = res[1];

      return runTasks(writeScreenshots, opts, runnableTasks, runnablePaths);
    })
    .catch(function(e) {
      return gitCmds
        .safeUnstashAll()
        .then(function() {
          return Promise.reject(e);
        });
    })
    .then(gitCmds.safeUnstashAll)
    .then(function() {
      console.log(
        'Repo back to modified state. Getting new screenshots and comparing ' +
        'them with previously recorded ones...\n'
      );
      return runTasks(compareScreenshots, opts, runnableTasks, runnablePaths);
    })
    .then(function() {
      return Promise.map(paths, function(dir, i) {
        return Promise.map(tasks[i], function(task) {
          var p = path.join(
            dir,
            consts.HUXLEY_FOLDER_NAME,
            task.name + consts.TASK_FOLDER_SUFFIX
          );
          return removeDirIfOk(p);
        });
      });
    });
}

module.exports = defaultWorkflow;
