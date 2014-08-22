'use strict';

var Promise = require('bluebird');

var glob = require('glob');

module.exports = Promise.promisify(glob);
