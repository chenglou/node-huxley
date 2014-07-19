'use strict';

var expect = require('expect');

var browser;
var click;

xdescribe('processActions', function() {
  beforeEach(function() {
    click = require('../click');
    browser = require('../../../browser/browser');
  });

  this.timeout(8000);

  it('clicks', function() {
    var ff = browser.open('firefox');

  });
});
