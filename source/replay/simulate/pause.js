var Promise = require('bluebird');

function simulatePause(ms) {
  return Promise.delay(ms);
}

module.exports = simulatePause;
