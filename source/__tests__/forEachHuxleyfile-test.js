'use strict';

var expect = require('expect');

var forEachHuxleyfile;
var path;
var webdriver;

describe('forEachHuxleyfile', function() {
  var spy;
  var callParams;

  beforeEach(function() {
    forEachHuxleyfile = require('../forEachHuxleyfile');
    path = require('path');
    webdriver = require('selenium-webdriver');

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
    // should pass the complete set of options, but it's ok here because the
    // test doesn't advance far enough to need them
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

  xit('uses the injected driver & deduces the browser name correctly', function(done) {
    var p = path.join(__dirname, '../fileOps/__tests__/fixture/**/Huxleyfile.json');

     var browser = webdriver.Capabilities.chrome();
     var driver = new webdriver.Builder()
       .usingServer('http://localhost:9515')
       .withCapabilities(browser)
       .build();

    var opts = {
      globs: [p],
      browserName: 'mozzarella foxfire',
      injectedDriver: driver,
    };

    forEachHuxleyfile(spy, opts)
      .then(function(err) {
        expect(callParams[1].length).toBe(2);
        expect(callParams[2].indexOf('/nested') > 1).toBe(true);
        expect(callParams[3]).toEqual('chrome');
        done();
      });
  });
});

