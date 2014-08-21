var Promise = require('bluebird');

var execP = require('../promisified/execP');

// git stash: save all modifications of already tracked files
// git add .: now there are only untracked files. Track them
// git stash: stash these too

// invariant: the repo looks the same before and after this operation
function safeStashAll() {
  return execP('git stash && git add . && git stash')
    .catch(function(e) {
      return safeUnstashAll()
        .then(function() {
          return Promise.reject(e);
        });
    });
}

// git stash pop: pop newly added files
// git reset HEAD .: un-add them
// git stash pop --index: revert first stash.
// --index reverts exactly to previous state (partial add, stage, etc.)
function safeUnstashAll() {
  return execP('git stash pop && git reset HEAD . && git stash pop --index')
    .catch(function(err) {
      if (err && err.message && err.message.indexOf('No stash found') > -1) {
        // this is ok. Caused by second `stash pop` returning and error
        return;
      }
      return Promise.reject(err);
    });
}

module.exports = {
  safeStashAll: safeStashAll,
  safeUnstashAll: safeUnstashAll,
};
