var Promise = require('bluebird');

var consts = require('../constants');
var globP = require('../promisified/globP');
var path = require('path');
var rimrafP = require('../promisified/rimrafP');

// during the cleanup phase, remove the directory if there's no '*-diff.png' in
// it (aka, the screenshots comparison went fine)
function removeDirIfOk(p) {
  return globP(path.join(p, '*' + consts.DIFF_PNG_SUFFIX))
    .then(function(res) {
      if (res.length === 0) {
        return rimrafP(p);
      }
      return Promise.resolve();
    });
}

module.exports = removeDirIfOk;
