var filterUnchangedTasks = require('./filterUnchangedTasks');

// trim each of the Huxleyfile content down to only tasks that are identical
// from the before copy and the after copy. Filter away the empty Huxleyfiles
// afterward
function filterFilesForUnchangedTasks(before, after, paths) {
  var pathsRes = [];
  var tasksRes = [];

  for (var i = 0; i < before.length; i++) {
    var unchangedTasks = filterUnchangedTasks(before[i], after[i]);
    if (unchangedTasks.length > 0) {
      tasksRes.push(unchangedTasks);
      pathsRes.push(paths[i]);
    }
  }

  return [tasksRes, pathsRes];
}

module.exports = filterFilesForUnchangedTasks;
