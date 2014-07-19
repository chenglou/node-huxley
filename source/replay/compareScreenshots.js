'use strict';

var xScreenshots = require('./xScreenshots');

function compareScreenshots(a, b, c, d) {
  return xScreenshots(a, b, c, d, true);
}

module.exports = compareScreenshots;
