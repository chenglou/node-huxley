'use strict';

var _ = require('lodash');
var consts = require('./constants');
var path = require('path');

function getDefaultOpts(opts) {
  var newOpts = {};

  if (opts.globs && opts.globs.length !== 0) {
    newOpts.globs = opts.globs.map(function(g) {
      // if the user didn't append 'Huxleyfile.json' at the end of the glob, do
      // it for them
      return _.endsWith(g, consts.HUXLEYFILE_NAME) ?
        g :
        path.join(g, consts.HUXLEYFILE_NAME);
    });
  } else {
    newOpts.globs = [path.join(process.cwd(), '**', consts.HUXLEYFILE_NAME)];
  }
  newOpts.browserName = (opts.browserName && opts.browserName.toLowerCase()) || 'firefox';
  newOpts.serverUrl = opts.serverUrl;
  newOpts.taskName = opts.taskName;
  newOpts.injectedDriver = opts.injectedDriver;

  return newOpts;
}

module.exports = getDefaultOpts;
