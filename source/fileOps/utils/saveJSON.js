var fsP = require('../../promisified/fsP');
var mkdirpP = require('../../promisified/mkdirpP');
var path = require('path');

function saveJSON(p, data) {
  return mkdirpP(path.dirname(p))
    .then(function() {
      return fsP.writeFileAsync(
        p,
        JSON.stringify(data, null, 2), // prettify, 2-space indent
        {encoding: 'utf8'}
      );
    });
}

module.exports = saveJSON;
