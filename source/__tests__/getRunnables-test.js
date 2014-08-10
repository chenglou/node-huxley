'use strict';

var expect = require('expect');

var getRunnables;

describe('getRunnables', function() {
  beforeEach(function() {
    getRunnables = require('../getRunnables');
  });

  it('runs all the tasks if there is no taskName tasks present', function() {
    var JSONs = [
      [{name: 'a', bla: 'asd'}, {name: 'b'}],
      [{name: 'c'}, {name: 'd'}]
    ];
    var paths = [1, 2];
    expect(getRunnables(JSONs, paths)).toEqual([JSONs, paths]);
  });

  it('should only run the designated tasks if taskName is present', function() {
    var JSONs = [
      [{name: 'a', bla: 'asd'}, {name: 'b'}],
      [{name: 'c'}, {name: 'd'}]
    ];
    var paths = [1, 2];
    expect(getRunnables(JSONs, paths, 'b')).toEqual([[[{name: 'b'}]], [1]]);

    var raw2 = [
      [{name: 'a', bla: 'asd'}, {name: 'b'}],
      [{name: 'c'}, {name: 'b'}]
    ];
    expect(getRunnables(raw2, paths, 'b'))
      .toEqual([[[{name: 'b'}], [{name: 'b'}]], paths]);
  });
});
