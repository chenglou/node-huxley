// the script that will be injected into the page for listening to user input
(function() {
  var events = [];

  window.addEventListener('click', function(e) {
    events.push([Date.now(), 'click', [e.clientX, e.clientY]]);
  }, true);

  window.addEventListener('keypress', function(e) {
    // the way dom deals with keydown/press/up and which charCode/keyCode/which
    // we receive is really screwed up. If you google "keyCode charCode which"
    // you'll see why the `or` is here
    events.push(
      [Date.now(), 'keypress', String.fromCharCode(e.keyCode || e.which)]
    );
  }, true);

  // TODO: double click (?), right click
  window._getHuxleyEvents = function() {
    return events;
  };
})();
