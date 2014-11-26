var Promise = require('bluebird');

var _ = require('lodash');
var filterExistingRecords = require('./filterExistingRecords');
var filterFilesForUnchangedTasks = require('./filterFilesForUnchangedTasks');
var getFlatUniquePaths = require('../fileOps/utils/getFlatUniquePaths');
var gitCmds = require('./gitCmds');
var loadJSON = require('../fileOps/utils/loadJSON');
var path = require('path');

// returns [[[unchangedTask]], [HuxleyfileDirectory]]
// definition of an unchanged task: if it exists before and after stashing
// the content can change, and that's fine

// TODO: change that behavior ^

// invariant: the repo looks the same before and after this operation
function getUnchangedTasks(globs) {
  var prevPaths;
  var nextPaths;
  var unchangedPaths;
  var prevFiles;
  var nextFiles;
  var tasks1;
  var paths1;
  var tasks;
  var paths;

  // time: current
  return getFlatUniquePaths(globs)
    .then(function(res) {
      nextPaths = res;
      return gitCmds.safeStashAll();
    })
    .then(function() {
      // time: prev
      return getFlatUniquePaths(globs);
    })
    .then(function(res) {
      prevPaths = res;
      unchangedPaths = _.intersection(prevPaths, nextPaths);

      if (unchangedPaths.length === 0) {
        return Promise.reject(
          new Error('No Huxleyfile found that is unchanged.')
        );
      }

      // at this point, we got all the `Huxleyfile.json`s directory paths that
      // exist before and after stashing
      return Promise.map(unchangedPaths, loadJSON);
    })
    .then(function(res) {
      prevFiles = res;
      return gitCmds.safeUnstashAll();
    })
    .then(function() {
      // time: current
      return Promise.map(unchangedPaths, loadJSON);
    })
    .then(function(res) {
      // at this point, we read all the `Huxleyfile.json`s of those paths
      nextFiles = res;

      var unchangedContainerPaths = unchangedPaths.map(path.dirname);
      var res1 = filterFilesForUnchangedTasks(
        prevFiles,
        nextFiles,
        unchangedContainerPaths
      );

      // not done! We need to make sure these tasks' `record.json`s actually
      // exist
      return filterExistingRecords(res1[0], res1[1]);
    })
    .spread(function(a, b) {
      tasks1 = a;
      paths1 = b;
      return gitCmds.safeStashAll();
    })
    .then(function() {
      // time: prev
      return filterExistingRecords(tasks1, paths1);
    })
    .spread(function(a, b) {
      tasks = a;
      paths = b;
      return gitCmds.safeUnstashAll();
    })
    .then(function() {
      // time: current
      if (tasks.length === 0) {
        return Promise.reject(new Error('No task found that is unchanged.'));
      }

      return [tasks, paths];
    });
}

module.exports = getUnchangedTasks;
