'use strict';

var Promise = require('bluebird');

var browser = require('./browser/browser');
var defaultCb = require('./defaultCb');
var getHuxleyfilesPaths = require('./fileOps/getHuxleyfilesPaths');
var loadJSON = require('./fileOps/loadJSON');
var path = require('path');

function forEachHuxleyfileRaw(fn, globs, browserName, serverUrl, cb) {
  var driver;

  return getHuxleyfilesPaths(globs)
    .then(function(ps) {
      if (ps.length === 0) {
        return Promise.reject(new Error('No Huxleyfile found.'));
      }
      var dirs = ps.map(path.dirname);
      return [Promise.map(ps, loadJSON).all(), dirs];
    })
    .spread(function(JSONs, ps) {
      // why opening the browser (the single slowest operation) is synchronous,
      // I cannot understand. Do it as late as possible if the above stuff
      // throws
      driver = browser.open(browserName, serverUrl);
      return Promise.each(JSONs, function(content, i) {
        return fn(driver, content, ps[i], browserName);
      });
    })
    .finally(function() {
      if (driver) {
        return browser.quit(driver);
      }
    })
    .then(cb.bind(null, null), cb);
}

function forEachHuxleyfile(fn, globs, browserName, serverUrl, cb) {
  if (globs.length === 0) {
    globs = [path.join(process.cwd(), '**')];
  }
  browserName = (browserName && browserName.toLowerCase()) || 'firefox';
  cb = cb || defaultCb;

  return forEachHuxleyfileRaw(fn, globs, browserName, serverUrl, cb);
}

module.exports = forEachHuxleyfile;
