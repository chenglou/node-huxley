var Promise = require('bluebird');
var fsP = require('../promisified/fsP');

function loadJSON(p) {
  return fsP
    .readFileAsync(p, {encoding: 'utf8'})
    .then(JSON.parse);
}

module.exports = loadJSON;
