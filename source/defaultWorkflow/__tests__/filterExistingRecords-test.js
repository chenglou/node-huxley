'use strict';

var expect = require('expect');

var filterExistingRecords;
var fs;
var mkdirp;
var path;
var rimraf;

var dir;

var Huxleyfile1 = [{name: 'one'}, {name: 'two'}];
var Huxleyfile2 = [{name: 'three'}];
var Huxleyfile3 = [{name: 'three'}];

describe('filterExistingRecords', function() {
  beforeEach(function() {
    filterExistingRecords = require('../filterExistingRecords');
    fs = require('fs');
    mkdirp = require('mkdirp');
    path = require('path');
    rimraf = require('rimraf');

    dir = path.join(__dirname, 'temp' + Math.random());
    mkdirp.sync(dir);
  });

  afterEach(function() {
    rimraf.sync(dir);
  });

  it('filters out files that do not exist', function(done) {
    // TODO: write a utility for generating this more easily
    var p1 = path.join(dir, 'Huxleyfolder');
    mkdirp.sync(p1);
    fs.writeFileSync(path.join(p1, 'one.record.json'), 'asd');

    var dir2 = path.join(dir, 'nested_folder');
    var p2 = path.join(dir2, 'Huxleyfolder');
    mkdirp.sync(p2);
    fs.writeFileSync(path.join(p2, 'three.record.json'), 'asd');

    filterExistingRecords(
      [Huxleyfile1, Huxleyfile2, Huxleyfile3],
      [dir, dir2, 'bla']
    ).then(function(res) {
        expect(res).toEqual([[[Huxleyfile1[0]], Huxleyfile2], [dir, dir2]]);
        done();
      }, done);
  });
});
