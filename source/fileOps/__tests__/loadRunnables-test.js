'use strict';

var expect = require('expect');

var loadRunnables;
var path;

function samePaths(actual, expected) {
  expect(expected.length).toBe(actual.length);
  actual.forEach(function(a, i) {
    expect(a.indexOf(expected[i]) > 0).toBe(true);
  });
}

describe('loadRunnables', function() {
  beforeEach(function() {
    loadRunnables = require('../loadRunnables');
    path = require('path');
  });

  it('returns the Huxleyfiles contents and paths', function(done) {
    var p = path.join(__dirname, 'fixture/**/Huxleyfile.json');
    // should dedupe
    var globs = [p, p];

    var expected = [
      [
        {name: '1 task', screenSize: [750, 500], url: 'foo'},
        {name: '2 task', url: 'bar'}
      ],
      [
        {name: '1 nested', url: 'baz'},
        {name: '2 nested', url: 'qux'}
      ]
    ];

    loadRunnables(globs)
      .spread(function(tasks, paths) {
        expect(tasks).toEqual(expected);
        samePaths(paths, ['fixture', 'fixture/nested']);
        done();
      }, done);
  });

  it('only returns the tasks indicated by taskName', function(done) {
    var p = path.join(__dirname, 'fixture/nested/Huxleyfile.json');
    var expected = [
      [{name: '2 nested', url: 'qux'}]
    ];

    loadRunnables([p], '2 nested')
      .spread(function(tasks, paths) {
        expect(tasks).toEqual(expected);
        samePaths(paths, ['fixture/nested']);
        done();
      }, done);
  });

  it('does not load anything if it cannot find anything', function(done) {
    var p = path.join(__dirname, 'fixture/Huxleyfile.json');

    loadRunnables([p], 'bla')
      .then(function(res) {
        expect(res).toEqual([[], []]);
        done();
      }, done);
  });
});
