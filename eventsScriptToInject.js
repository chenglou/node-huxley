// the script that will be injected into the page for listening to user input
(function() {
  var events = [];

  window.addEventListener('click', function(e) {
    events.push([Date.now(), 'click', [e.clientX, e.clientY]]);
  }, true);

  window.addEventListener('keypress', function(e) {
    events.push([Date.now(), 'keypress', String.fromCharCode(e.keyCode || e.which)]);
  }, true);

  // TODO: double click (?), right click

  window._getHuxleyEvents = function() {
    return events;
  };
})();
