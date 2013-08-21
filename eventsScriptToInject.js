// the script that will be injected into the page for listening to user input
(function() {
  var events = [];

  window.addEventListener('click', function(e) {
    events.push([Date.now(), 'click', [e.clientX, e.clientY]]);
  }, true);

  window.addEventListener('keyup', function(e) {
    events.push([Date.now(), 'keyup', String.fromCharCode(e.keyCode)]);
  }, true);

  // TODO: double click (?), right click, cap char detection

  window._getHuxleyEvents = function() {
    return events;
  };
})();
