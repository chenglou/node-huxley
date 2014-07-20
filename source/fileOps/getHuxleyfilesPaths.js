'use strict';

var Promise = require("bluebird");

var _ = require('lodash');
var globP = require('../promisified/globP');
var path = require('path');
var consts = require('../constants');

function getHuxleyfilesPaths(globs) {
  return Promise
    .map(globs, function(g) {
      return globP(path.join(g, consts.HUXLEYFILE_NAME));
    })
    .all()
    .then(function(huxleyfilesPaths) {
      return _.uniq(_.flatten(huxleyfilesPaths));
    });
}

module.exports = getHuxleyfilesPaths;
