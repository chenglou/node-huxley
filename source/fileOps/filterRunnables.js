'use strict';

// trim down the Huxleyfile json tasks to only those asked to run by `taskName`
// (the -o flag in CLI)
function filterRunnables(JSONs, paths, taskName) {
  // since the JSONS array might shrink, pass huxleyfile paths too and shrink
  // accordingly
  if (taskName == null) {
    return [JSONs, paths];
  }

  var filtered = JSONs.map(function(JSONContent) {
    return JSONContent.filter(function(task) {
      return task.name === taskName;
    });
  });

  var newJSONs = [];
  var newPaths = [];
  for (var i = 0; i < filtered.length; i++) {
    if (filtered[i].length !== 0) {
      newJSONs.push(filtered[i]);
      newPaths.push(paths[i]);
    }
  }

  return [newJSONs, newPaths];
}

module.exports = filterRunnables;
