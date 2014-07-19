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
    nexpect
      .spawn('node ' + path.join(__dirname, '/recordCLIUntilQuitRunner.js'))
      .expect('> ')
      .sendline('')
      .expect('screenshot 1 recorded.')
      .expect('> ')
      .sendline('l')
      .expect('screenshot 2 recorded.')
      .expect('> ')
      .sendline('q')
      .sendEof()
      .run(function(err, stdout, exitcode) {
        done(err);
      });
  });
});

