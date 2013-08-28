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

var sleepFactor = .5;

function doSomething(next, event) {
  return function() {
    setTimeout(function() {
      console.log(event.action);
      next(Math.random() > .3 ? 0 : 1); // err simulation
    }, 1000);
  };
}

var startTime = Date.now();
var count = 0;
function next(err) {
  if (err) console.log('fuck man');
  var fn;
  if (count === events.length - 1) {
    fn = doSomething(done, events[count]);
  } else {
    fn = doSomething(next, events[count]);
  }

  setTimeout(fn, events[count].offsetTime * sleepFactor - Date.now() + startTime);
  count++;
}

function done(err) {
  if (err) console.log('fuck');
  console.log('done');
}

next();
