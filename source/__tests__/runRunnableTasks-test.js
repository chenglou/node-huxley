'use strict';

var expect = require('expect');

var runRunnableTasks;
var path;
var webdriver;

describe('runRunnableTasks', function() {
  var spy;
  var callParams;

  beforeEach(function() {
    runRunnableTasks = require('../runRunnableTasks');
    path = require('path');
    webdriver = require('selenium-webdriver');

    // yeah I'll replace this with a real mock at one point
    callParams = [];
    spy = function() {callParams = arguments;};
  });

  this.timeout(8000);

  it('should pass good arguments', function(done) {
    var p = path.join(__dirname, '../fileOps/__tests__/fixture/**/Huxleyfile.json');
    // should pass the complete set of options, but it's ok here because the
    // test doesn't advance far enough to need them
    var opts = {
      globs: [p],
      browserName: 'firefox',
    };
    runRunnableTasks(spy, opts)
      .then(function(err) {
        expect(callParams[1].length).toBe(2);
        expect(callParams[2].indexOf('/nested') > 1).toBe(true);
        expect(callParams[3]).toEqual('firefox');
        done();
      });
  });

  it('uses the injected driver & deduces the browser name correctly', function(done) {
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

    runRunnableTasks(spy, opts)
      .then(function(err) {
        expect(callParams[1].length).toBe(2);
        expect(callParams[2].indexOf('/nested') > 1).toBe(true);
        expect(callParams[3]).toEqual('chrome');
        done();
      });
  });
});

