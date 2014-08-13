'use strict';

var expect = require('expect');

var forEachHuxleyfile;
var path;

describe('forEachHuxleyfile', function() {
  var spy;
  var callParams;

  beforeEach(function() {
    forEachHuxleyfile = require('../forEachHuxleyfile');
    path = require('path');
    // yeah I'll replace this with a real mock at one point
    callParams = [];
    spy = function() {callParams = arguments;};
  });

  this.timeout(4000);

  it('should stop if no huxleyfile was found', function(done) {
    // not a valid glob for huxleyfile
    var p = path.join(__dirname, '../fileOps/__tests__/');
    var opts = {
      globs: [p],
    };
    forEachHuxleyfile(spy, opts)
      .then(function() {
        done('Should have errored.');
      })
      .catch(function() {
        expect(callParams).toEqual([]);
        done();
      });
  });

  xit('should pass good arguments', function(done) {
    var p = path.join(__dirname, '../fileOps/__tests__/fixture/**/Huxleyfile.json');
    var opts = {
      globs: [p],
    };
    forEachHuxleyfile(spy, opts)
      .then(function(err) {
        expect(callParams[1].length).toBe(2);
        expect(callParams[2].indexOf('/nested') > 1).toBe(true);
        expect(callParams[3]).toEqual('firefox');
        done();
      });
  });

  xit('should work', function(done) {
    var p = path.join(__dirname, '../fileOps/__tests__/fixture/**/Huxleyfile.json');
    var opts = {
      globs: [p],
      browserName: 'firefox',
    };
    forEachHuxleyfile(spy, opts)
      .then(function(err) {
        expect(callParams[1].length).toBe(2);
        expect(callParams[2].indexOf('/nested') > 1).toBe(true);
        expect(callParams[3]).toEqual('firefox');
        done();
      });
  });
});

