'use strict';

var Promise = require("bluebird");

var _ = require('lodash');
var globP = require('../promisified/globP');

function getHuxleyfilesPaths(globs) {
  return Promise
    .map(globs, function(g) {
      return globP(g);
    })
    .all()
    .then(function(huxleyfilesPaths) {
      return _.uniq(_.flatten(huxleyfilesPaths));
    });
}

module.exports = getHuxleyfilesPaths;
