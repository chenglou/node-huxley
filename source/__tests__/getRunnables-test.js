'use strict';

var expect = require('expect');

var getRunnables;

describe('getRunnables', function() {
  beforeEach(function() {
    getRunnables = require('../getRunnables');
  });

  it('runs all the tasks if there is no nameOnly tasks present', function() {
    var JSONs = [
      [{name: 'a', bla: 'asd'}, {name: 'b'}],
      [{name: 'c'}, {name: 'd'}]
    ];
    var paths = [1, 2];
    expect(getRunnables(JSONs, paths)).toEqual([JSONs, paths]);
  });

  it('should only run nameOnly tasks if there is any', function() {
    var JSONs = [
      [{name: 'a', bla: 'asd'}, {nameOnly: 'b'}],
      [{name: 'c'}, {name: 'd'}]
    ];
    var paths = [1, 2];
    expect(getRunnables(JSONs, paths)).toEqual([[[{nameOnly: 'b'}]], [1]]);

    var raw2 = [
      [{name: 'a', bla: 'asd'}, {nameOnly: 'b'}],
      [{name: 'c'}, {nameOnly: 'd'}]
    ];
    expect(getRunnables(raw2, paths))
      .toEqual([[[{nameOnly: 'b'}], [{nameOnly: 'd'}]], paths]);
  });
});
