'use strict';

var Promise = require('bluebird');

var exec = require('child_process').exec;

module.exports = Promise.promisify(exec);
