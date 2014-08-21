'use strict';

var expect = require('expect');

var runTasks;

// TODO: add more tests here
describe('runTasks', function() {
  var spy;
  var callParams;

  beforeEach(function() {
    runTasks = require('../runTasks');

    // yeah I'll replace this with a real mock at one point
    callParams = [];
    spy = function() {callParams = arguments;};
  });

  it('should stop if there is no task to execute', function(done) {
    runTasks(spy, {}, [[], []], [])
      .then(function() {
        done('Should have errored.');
      })
      .catch(function(e) {
        expect(callParams).toEqual([]);
        expect(e.message).toBe('Designated Huxleyfile(s) empty.');
      })
      .then(function() {
        return runTasks(spy, {taskName: 'bla'}, [[], []], [])
          .then(function() {
            done('Should have errored.');
          })
          .catch(function(e) {
            expect(callParams).toEqual([]);
            expect(e.message).toBe('No task named "bla" found.');
            done();
          });
      });
  });
});

