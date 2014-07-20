'use strict';

function getRunnables(JSONs, paths) {
  // if there's a `nameOnly` task, run only the `nameOnly` ones. Otherwise run
  // all tasks. This is akin to jasmine's describe and describe.only

  // since the JSONS array might shrink, pass huxleyfile paths too and shrink
  // accordingly
  var hasNameOnly = false;
  var filtered = JSONs.map(function(JSONContent) {
    return JSONContent.filter(function(task) {
      if (task.nameOnly != null) {
        hasNameOnly = true;
        return true;
      }
      return false;
    });
  });

  if (!hasNameOnly) {
    return [JSONs, paths];
  }

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

module.exports = getRunnables;
