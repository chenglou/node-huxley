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

  xit('should stop if no huxleyfile was found', function(done) {
    // not a valid glob for huxleyfile
    var p = path.join(__dirname, '../fileOps/__tests__/');
    forEachHuxleyfile(spy, [p], 'firefox', null, function(err) {
      expect(callParams).toEqual([]);
      if (err != null) {
        done();
      } else {
        done('Should have errored.');
      }
    });
  });

  it('should provide defaults and pass good arguments', function(done) {
    var p = path.join(__dirname, '../fileOps/__tests__/fixture/**');
    forEachHuxleyfile(spy, [p], null, null, function(err) {
      expect(callParams[2].indexOf('/nested') > 1).toBe(true);
      expect(callParams[3]).toEqual('firefox');
      console.log(callParams);
      done(err);
    });
  });

  xit('should work', function(done) {
    var p = path.join(__dirname, '../fileOps/__tests__/fixture/**');
    forEachHuxleyfile(spy, [p], 'firefox', null, function(err) {
      // once for each huxleyfile
      expect(callParams).toEqual(2);
      done(err);
    });
  });
});

