'use strict';

var Promise = require("bluebird");

var rimraf = require('rimraf');

module.exports = Promise.promisify(rimraf);
