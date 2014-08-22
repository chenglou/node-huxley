var _ = require('lodash');

// [{name: 'a', 'url': 'bla'}] -> {a: {name: 'a', 'url': 'bla'}}
// turn the Huxleyfile task array into an object for easier/faster later task
// retrieval by name. See `filterUnchangedTasks`
function toMap(tasks) {
  return _.object(_.pluck(tasks, 'name'), tasks);
}

function filterUnchangedTasks(a, b) {
  var aNames = _.pluck(a, 'name');
  var bNames = _.pluck(b, 'name');
  var unchangedNames = _.intersection(aNames, bNames);
  var aMap = toMap(a);
  var bMap = toMap(b);

  // unchanged names aren't enough. The whole task (obj) should be unchanged
  return unchangedNames.filter(function(n) {
    return _.isEqual(aMap[n], bMap[n]);
  }).map(function(n) {
    return aMap[n];
  });
}

module.exports = filterUnchangedTasks;
