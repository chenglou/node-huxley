'use strict';

var expect = require('expect');

var consts;
var insertPauses;

describe('insertPauses', function() {
  beforeEach(function() {
    insertPauses = require('../insertPauses');
  });

  it('inserts nothing when there is nothing', function() {
    expect(insertPauses([])).toEqual([]);
  });

  it('inserts nothing when there is no live playback', function() {
    var actions = [
      {action: 'a', timeStamp: 1},
      {action: 'b', timeStamp: 2},
      {action: 'c', timeStamp: 3},
    ];
    expect(insertPauses(actions)).toEqual(actions);
  });

  it('inserts pauses when there is a live playback first', function() {
    var actions = [
      {action: 'livePlayback', timeStamp: 1},
      {action: 'a', timeStamp: 3},
      {action: 'b', timeStamp: 7},
      {action: 'c', timeStamp: 10},
    ];
    expect(insertPauses(actions)).toEqual([
      {action: 'livePlayback', timeStamp: 1},
      {action: 'pause', ms: 2},
      {action: 'a', timeStamp: 3},
      {action: 'pause', ms: 4},
      {action: 'b', timeStamp: 7},
      {action: 'pause', ms: 3},
      {action: 'c', timeStamp: 10},
    ]);
  });

  it('inserts no pause when there is a live playback last', function() {
    var actions = [
      {action: 'a', timeStamp: 3},
      {action: 'livePlayback', timeStamp: 5},
    ];
    expect(insertPauses(actions)).toEqual([
      {action: 'a', timeStamp: 3},
      {action: 'livePlayback', timeStamp: 5},
    ]);
  });

  it('inserts more pauses correcly', function() {
    var actions = [
      {action: 'a', timeStamp: 3},
      {action: 'livePlayback', timeStamp: 19},
      {action: 'a', timeStamp: 21},
      {action: 'b', timeStamp: 25},
      {action: 'livePlayback', timeStamp: 30},
      {action: 'c', timeStamp: 45},
      {action: 'a', timeStamp: 46},
    ];
    expect(insertPauses(actions)).toEqual([
      {action: 'a', timeStamp: 3},
      {action: 'livePlayback', timeStamp: 19},
      {action: 'pause', ms: 2},
      {action: 'a', timeStamp: 21},
      {action: 'pause', ms: 4},
      {action: 'b', timeStamp: 25},
      {action: 'pause', ms: 5},
      {action: 'livePlayback', timeStamp: 30},
      {action: 'c', timeStamp: 45},
      {action: 'a', timeStamp: 46},
    ]);
  });
});

