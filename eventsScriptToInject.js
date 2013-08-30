// the script that will be injected into the page for listening to user input
(function() {
  var events = [];
  var specialKeysMap = {
    '37': 'ARROW_LEFT',
    '38': 'ARROW_UP',
    '39': 'ARROW_RIGHT',
    '40': 'ARROW_DOWN'
  };

  window.addEventListener('click', function(e) {
    events.push({
      action: 'click',
      timeOffset: Date.now(),
      position: [e.clientX, e.clientY]
    });
  }, true);

  // only `keypress` returns the correct character. `keydown` returns `A` when
  // pressing `a`, etc.
  window.addEventListener('keypress', function(e) {
    // chrome doesn't trigger `keypress` for arrow keys while ff does. Just
    // handle them apart below in `keydown`
    var code = e.keyCode || e.which;
    if (code >= 37 && code <= 40) return;
    // the way dom deals with keydown/press/up and which charCode/keyCode/which
    // we receive is really screwed up. If you google "keyCode charCode which"
    // you'll see why the `or` is here
    events.push({
      action: 'keypress',
      timeOffset: Date.now(),
      key: String.fromCharCode(code)
    });
  }, true);

  // arrow keys are not registered by `keypress` in chrome, so handle them here.
  // They also clash with `&`, `%`, `'` and `(`, so map them to a something
  // readable for now. Will take care of processing this and simulating the
  // keypress correctly in playback mode.
  window.addEventListener('keydown', function(e) {
    var code = e.keyCode || e.which;
    if (code < 37 || code > 40) return;
    // treat it as a `keypress` for simplicity during playback simulation
    events.push({
      action: 'keypress',
      timeOffset: Date.now(),
      key: specialKeysMap[code]
    });
  });

  // TODO: maybe double click and right click in the future, but Selenium
  // support and manual reproduction are shaky
  window._getHuxleyEvents = function() {
    return events;
  };
})();
