'use strict';

var colors = require('colors');

// default callback used by bin/hux when Huxley finishes
function defaultDoneCallback(err) {
  if (err) {
    console.error(typeof err === 'string' ? err.red : err.message.red);
    console.error('\nThe tests now halt. You might have unfinished tasks.'.red);
  } else {
    console.log('\nAll done successfully!'.green);
  }
}

module.exports = defaultDoneCallback;
