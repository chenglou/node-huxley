'use strict';

var Promise = require('bluebird');

var filterRunnables = require('./filterRunnables');
var getFlatUniquePaths = require('./utils/getFlatUniquePaths');
var loadJSON = require('./utils/loadJSON');
var path = require('path');

function loadRunnables(globs, taskName) {
  return getFlatUniquePaths(globs)
    .then(function(ps) {
      if (ps.length === 0) {
        return Promise.reject(new Error('No Huxleyfile found.'));
      }
      var dirs = ps.map(path.dirname);
      return Promise.join(Promise.map(ps, loadJSON).all(), dirs);
    })
    .spread(function(JSONs, dirs) {
      return filterRunnables(JSONs, dirs, taskName);
    });
}

module.exports = loadRunnables;
