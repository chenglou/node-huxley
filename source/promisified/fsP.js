'use strict';

var Promise = require("bluebird");

var fs = require('fs');

module.exports = Promise.promisifyAll(fs);
