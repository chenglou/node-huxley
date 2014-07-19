'use strict';

var xScreenshots = require('./xScreenshots');

function writeScreenshots(a, b, c, d) {
  return xScreenshots(a, b, c, d, false);
}

module.exports = writeScreenshots;
