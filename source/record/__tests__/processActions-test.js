'use strict';

var expect = require('expect');

var consts;
var processActions;

describe('processActions', function() {
  beforeEach(function() {
    consts = require('../../constants');
    processActions = require('../processActions');
  });

  it('should return [] if there is no screenshot action', function() {
    expect(processActions([{action: 'asd'}], [{action: 'asd'}])).toEqual([]);
  });

  it('should concat actions correctly', function() {
    var actions1 = [
      {action: consts.STEP_CLICK, timeStamp: 10},
    ];
    var actions2 = [
      {action: consts.STEP_SCREENSHOT, timeStamp: 11},
    ];
    var expected = [
      {action: consts.STEP_CLICK},
      {action: consts.STEP_SCREENSHOT},
    ];
    expect(processActions(actions1, actions2)).toEqual(expected);
  });

  it('should sort actions correctly', function() {
    var actions1 = [
      {action: consts.STEP_CLICK, timeStamp: 10},
    ];
    var actions2 = [
      {action: consts.STEP_SCREENSHOT, timeStamp: 9},
      {action: consts.STEP_SCREENSHOT, timeStamp: 11},
    ];
    var expected = [
      {action: consts.STEP_SCREENSHOT},
      {action: consts.STEP_CLICK},
      {action: consts.STEP_SCREENSHOT},
    ];
    expect(processActions(actions1, actions2)).toEqual(expected);
  });

  it('should trim non-screenshot actions at the tail', function() {
    var actions1 = [
      {action: consts.STEP_CLICK, timeStamp: 10},
    ];
    var actions2 = [
      {action: consts.STEP_SCREENSHOT, timeStamp: 9},
    ];
    var expected = [
      {action: consts.STEP_SCREENSHOT},
    ];
    expect(processActions(actions1, actions2)).toEqual(expected);
  });

  it('inserts pauses between live-playback-ed actions and strip out those info',
    function() {
      var actions1 = [
        {action: consts.STEP_CLICK, timeStamp: 10},
      ];
      var actions2 = [
        {action: consts.STEP_SCREENSHOT, timeStamp: 9, livePlayback: true},
        {action: consts.STEP_SCREENSHOT, timeStamp: 12, livePlayback: true},
      ];

      var expected = [
        {action: consts.STEP_SCREENSHOT},
        {action: consts.STEP_PAUSE, ms: 1},
        {action: consts.STEP_CLICK},
        {action: consts.STEP_PAUSE, ms: 2},
        {action: consts.STEP_SCREENSHOT},
      ];

      expect(processActions(actions1, actions2)).toEqual(expected);
    }
  );
});

