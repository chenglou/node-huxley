'use strict';

var colors = require('colors');

// default callback used when Huxley finishes
function defaultCb(err) {
  if (err) {
    console.error(err.stack ? err.stack : err);
    console.error('\nThe tests now halt. You might have unfinished tasks.'.red);
  } else {
    console.log('\nAll done.');
  }
}

module.exports = defaultCb;
