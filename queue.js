var events = [
  {
    action: "screenshot",
    offsetTime: 1000,
  }, {
    action: "click",
    offsetTime: 2000,
  }, {
    action: "keyup",
    offsetTime: 3000,
  }
];

var actionsQueue = [];
var sleepFactor = 1;
events.forEach(function(event, i) {
  var offsetTime = i === 0
    ? event.offsetTime
    : event.offsetTime - events[i - 1].offsetTime;

  actionsQueue.push(
    function(advance) {
      setTimeout(function() {
        doSomething(advance, event);
      }, offsetTime * sleepFactor);
    }
  );
});

function doSomething(advance, event) {
  setTimeout(function() {
    console.log(event.action);
    advance();
  }, 1000);
}

function advance() {
  if (actionsQueue.length === 1) {
    actionsQueue.shift()(done);
  } else {
    actionsQueue.shift()(advance);
  }
}

function done() {
  console.log('done');
}

advance();
