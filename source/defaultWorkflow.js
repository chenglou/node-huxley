var Promise = require('bluebird');

var _ = require('lodash');
var compareScreenshots = require('./replay/compareScreenshots');
var consts = require('./constants');
var execP = require('./promisified/execP');
var forEachHuxleyfile = require('./forEachHuxleyfile');
var globP = require('./promisified/globP');
var loadRunnables = require('./fileOps/loadRunnables');
var path = require('path');
var rimrafP = require('./promisified/rimrafP');
var writeScreenshots = require('./replay/writeScreenshots');

var notGitMsg =
  'The default huxley workflow assumes the current folder uses git. This is what it does:\n' +
  '- store away the current unsaved changes\n' +
  '- record screenshots on the fresh, pre-change code, using that as the reference point\n' +
  '- restore the unsaved changes\n' +
  '- record the screenshots on the post-change code\n' +
  '- compare them to the previously recorded ones to make sure everything looks the same\n';

// TODO: better message...
var changedHuxleyfileOrRecordFileMsg =
  'There are currently uncommited Huxleyfile.json or record.json. Since the ' +
  'default workflow saves away your current changes in order to produce the ' +
  'screenshots of the previous clean repository state, the workflow would ' +
  'inadvertently revert those too. Aborting.';

function hasChangedHuxleyfileOrRecordFile(msg) {
  return msg.split('\n').some(function(line) {
    return _.endsWith(line, consts.HUXLEYFILE_NAME) ||
      _.endsWith(line, consts.RECORD_FILE_NAME);
  });
}

// during the cleanup phase, remove the directory if there's no '*-diff.png' in
// it (aka, the screenshots comparison went fine)
function removeDirIfOk(p) {
  return globP(path.join(p, '*' + consts.DIFF_PNG_NAME))
    .then(function(res) {
      if (res.length === 0) {
        return rimrafP(p);
      }
      return Promise.resolve();
    });
}

// will support hg in the future

// git stash: save all modifications of already tracked files
// git add .: now there are only untracked files. Track them
// git stash: stash these too
// ... do huxley stuff
// git stash pop: pop newly added files
// git reset HEAD .: un-add them
// git stash pop --index: revert first stash. --index reverts exactly to previous state (partial add, stage, etc.)
function defaultWorkflow(opts) {
  return execP('git status')
    .spread(function(stdout, stderr) {
      var errMsg;
      if (stderr !== '') {
        errMsg = stderr.indexOf('Not a git repository') > -1 ?
          notGitMsg :
          stderr;
      }
      if (hasChangedHuxleyfileOrRecordFile(stdout)) {
        errMsg = changedHuxleyfileOrRecordFileMsg;
      }
      if (errMsg) {
        return Promise.reject(new Error(errMsg));
      }

      return execP('git stash && git add . && git stash');
    })
    .then(function() {
      console.log(
        'Repo reverted to clean state. Looking at previous screenshots...\n'
      );
      return forEachHuxleyfile(writeScreenshots, opts);
    })
    .then(function() {
      // TODO: put this in a finally
      return execP('git stash pop && git reset HEAD . && git stash pop --index');
    })
    .catch(function(err) {
      if (err && err.message && err.message.indexOf('No stash found') > -1) {
        // this is ok. Caused by second `stash pop` returning and error
        return;
      }
      return Promise.reject(err);
    })
    .then(function() {
      console.log(
        'Repo back to modified state. Getting new screenshots and comparing ' +
        'them with previously recorded ones...\n'
      );
      return forEachHuxleyfile(compareScreenshots, opts);
    })
    .then(function() {
      return loadRunnables(opts.globs, opts.taskName);
    })
    .spread(function(runnableTasks, runnablePaths) {
      return Promise.map(runnablePaths, function(dir, i) {
        return Promise.map(runnableTasks[i], function(task) {
          var p = path.join(
            dir,
            consts.HUXLEY_FOLDER_NAME,
            task.name + consts.HUXLEY_FOLDER_SUFFIX
          );
          return removeDirIfOk(p);
        })
        .all();
      })
      .all();
    });
}

module.exports = defaultWorkflow;
