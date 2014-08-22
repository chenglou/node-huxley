'use strict';

var expect = require('expect');

var fs;
var mkdirp;
var path;
var removeDirIfOk;
var rimraf;

var dir;

describe('removeDirIfOk', function() {
  beforeEach(function() {
    fs = require('fs');
    mkdirp = require('mkdirp');
    path = require('path');
    removeDirIfOk = require('../removeDirIfOk');
    rimraf = require('rimraf');

    dir = path.join(__dirname, 'temp' + Math.random());
    mkdirp.sync(dir);
    fs.writeFileSync(path.join(dir, 'a.png'), 'asd');
    fs.writeFileSync(path.join(dir, 'b.png'), 'asd');
  });

  afterEach(function() {
    rimraf.sync(dir);
  });

  it('remove folders if there is no *-diff.png in it', function(done) {
    removeDirIfOk(dir)
      .then(function() {
        fs.existsSync(dir) ? done(dir + ' still exists.') : done();
      }, done);
  });

  it('keeps folders if there is *-diff.png in it', function(done) {
    fs.writeFileSync(path.join(dir, 'a-diff.png'), 'asd');

    removeDirIfOk(dir)
      .then(function() {
        fs.existsSync(dir) ? done() : done(dir + ' still exists.');
      }, done);
  });
});
