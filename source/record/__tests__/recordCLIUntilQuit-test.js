'use strict';

var expect = require('expect');

var nexpect;
var path;

describe('recordCLIUntilQuit', function() {
  beforeEach(function() {
    nexpect = require('nexpect');
    path = require('path');
  });

  it('should display recording messages', function(done) {
    // if something errors here during testing, it'll call `done` multiple time
    // so be careful when you read the error msg in the console
    nexpect
      .spawn('node ' + path.join(__dirname, '/recordCLIUntilQuitRunner.js'))
      .expect('> ')
      .sendline('')
      .expect('screenshot 1 recorded.')
      .expect('> ')
      .sendline('l')
      .expect('Live playback on')
      .expect('> ')
      .sendline('')
      .expect('screenshot 2 recorded.')
      .expect('> ')
      .sendline('l')
      .expect('Live playback off')
      .sendline('q')
      .sendEof()
      .run(function(err, stdout, exitcode) {
        done(err);
      });
  });
});

