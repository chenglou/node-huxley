'use strict';

var Promise = require('bluebird');

var mkdirp = require('mkdirp');

module.exports = Promise.promisify(mkdirp);
