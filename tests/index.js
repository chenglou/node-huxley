var exec = require('child_process').exec;
var glob = require('glob');
var colors = require('colors');

var huxleyPaths = glob.sync('./**/Huxleyfile.json').map(function(path) {
  // huxley appends the 'Huxleyfile.json' part itself; no need to include it
  // here. Also,
  return path
    .slice(0, path.lastIndexOf('/') + 1)
    .replace(/ /g, '\\ ');
});

// TODO: start selenium and server
function test(pathNumber) {
  if (pathNumber === huxleyPaths.length) {
    return console.log('All error tests failed correctly.'.green);
  }
  console.log(huxleyPaths[pathNumber]);
  exec('../bin/hux ' + huxleyPaths[pathNumber], function(err, stdout, stderr) {
    // TODO: not all errors. It's been a while. This folder has all tests
    if (!stderr) throw 'Error test didn\'t trigger: ' + huxleyPaths[pathNumber];

    console.log(stderr);
    test(pathNumber + 1);
  });
}

test(0);
