'use strict';

var expect = require('expect');

var filterUnchangedTasks;

var task11 = {name: 'one', someOherProp: [1, 2]}; // same as 21
var task12 = {name: 'two', url: 'bla'};
var task13 = {name: 'three', a: 'something', b: {}}; // same as 23

var task21 = {name: 'one', someOherProp: [1, 2]};
var task23 = {name: 'three', a: 'something', b: {}};
var task24 = {name: 'four', a: 'huh'};

describe('filterUnchangedTasks', function() {
  beforeEach(function() {
    filterUnchangedTasks = require('../filterUnchangedTasks');
  });

  it('works', function() {
    var a = [task11, task12, task13];
    var b = [task23, task21, task24];
    expect(filterUnchangedTasks(a, b)).toEqual([task11, task13]);
  });
});
