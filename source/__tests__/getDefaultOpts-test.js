'use strict';

var expect = require('expect');

var getDefaultOpts;
var path;

describe('getDefaultOpts', function() {
  beforeEach(function() {
    getDefaultOpts = require('../getDefaultOpts');
    path = require('path');
  });

  it('should provide right defaults', function() {
    expect(getDefaultOpts({})).toEqual({
      globs: [path.join(process.cwd(), '**', 'Huxleyfile.json')],
      browserName: 'firefox',
      serverUrl: undefined,
      taskName: undefined,
      injectedDriver: undefined,
    });

    var opts = {
      browserName: 'CHROME',
      globs: ['foo'],
      taskName: 'bar',
      serverUrl: 'baz',
      injectedDriver: 'qux',
    };
    expect(getDefaultOpts(opts)).toEqual({
      browserName: 'chrome',
      globs: ['foo/Huxleyfile.json'],
      taskName: 'bar',
      serverUrl: 'baz',
      injectedDriver: 'qux',
    });
  });
});

