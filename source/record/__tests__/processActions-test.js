'use strict';

var expect = require('expect');

var processActions;

describe('processActions', function() {
  beforeEach(function() {
    processActions = require('../processActions');
  });

  it('should return [] if there is no screenshot action', function() {
    expect(processActions([{action: 'a'}], [{action: 'a'}])).toEqual([]);
  });

  it('should concat actions and sort correctly', function() {
    var actions1 = [{action: 'a', timeStamp: 10}];
    var actions2 = [
      {action: 'b', timeStamp: 1},
      {action: 'screenshot', timeStamp: 20},
    ];
    expect(processActions(actions1, actions2)).toEqual([
      {action: 'b'},
      {action: 'a'},
      {action: 'screenshot'},
    ]);
  });

  it('should trim non-screenshot actions at the tail', function() {
    var actions1 = [
      {action: 'a', timeStamp: 1},
      {action: 'b', timeStamp: 12},
    ];
    var actions2 = [{action: 'screenshot', timeStamp: 9}];
    expect(processActions(actions1, actions2)).toEqual([
      {action: 'a'},
      {action: 'screenshot'},
    ]);
  });

  it('strips out livePlayback actions', function() {
    var actions1 = [
      {action: 'a', timeStamp: 3},
    ];
    var actions2 = [
      {action: 'livePlayback', timeStamp: 11},
      {action: 'screenshot', timeStamp: 23},
    ];

    expect(processActions(actions1, actions2)).toEqual([
      {action: 'a'},
      {action: 'pause', ms: 12},
      {action: 'screenshot'},
    ]);
  });

  it('inserts pauses between livePlayback actions', function() {
    var actions1 = [
      {action: 'a', timeStamp: 3},
      {action: 'b', timeStamp: 12},
      {action: 'c', timeStamp: 21},
    ];
    var actions2 = [
      {action: 'livePlayback', timeStamp: 11},
      {action: 'screenshot', timeStamp: 23},
    ];

    expect(processActions(actions1, actions2)).toEqual([
      {action: 'a'},
      {action: 'pause', ms: 1},
      {action: 'b'},
      {action: 'pause', ms: 9},
      {action: 'c'},
      {action: 'pause', ms: 2},
      {action: 'screenshot'},
    ]);
  });
});

