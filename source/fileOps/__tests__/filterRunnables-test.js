'use strict';

var expect = require('expect');

var filterRunnables;

describe('filterRunnables', function() {
  beforeEach(function() {
    filterRunnables = require('../filterRunnables');
  });

  it('returns all the tasks if there is no taskName present', function() {
    var JSONs = [
      [{name: 'a', bla: 'asd'}, {name: 'b'}],
      [{name: 'c'}, {name: 'd'}]
    ];
    var paths = [1, 2];
    expect(filterRunnables(JSONs, paths)).toEqual([JSONs, paths]);
  });

  it('should only run the designated tasks if taskName is present', function() {
    var JSONs = [
      [{name: 'a', bla: 'asd'}, {name: 'b'}],
      [{name: 'c'}, {name: 'd'}]
    ];
    var paths = [1, 2];
    expect(filterRunnables(JSONs, paths, 'b')).toEqual([[[{name: 'b'}]], [1]]);

    var raw2 = [
      [{name: 'a', bla: 'asd'}, {name: 'b'}],
      [{name: 'c'}, {name: 'b'}]
    ];
    expect(filterRunnables(raw2, paths, 'b'))
      .toEqual([[[{name: 'b'}], [{name: 'b'}]], paths]);
  });

  it('returns nothing if nothing matches', function() {
    var JSONs = [
      [{name: 'a', bla: 'asd'}, {name: 'b'}],
      [{name: 'c'}, {name: 'd'}]
    ];
    var paths = [1, 2];
    expect(filterRunnables(JSONs, paths, 'bla')).toEqual([[], []]);
  });
});
