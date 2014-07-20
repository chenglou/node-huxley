// this script will be injected into the page for listening to user input
(function() {
  /* global window */

  'use strict';

  var events = [];
  var specialKeysMap = {
    '37': 'ARROW_LEFT',
    '38': 'ARROW_UP',
    '39': 'ARROW_RIGHT',
    '40': 'ARROW_DOWN',
    '8': 'BACK_SPACE',
    '46': 'DELETE'
  };

  // we treat a click as a mousedown, because they behave the same way
  // except when, say, clicking on a label that causes the checkbox to be
  // checked. In this case, the click event fires twice, which is undesirable

  // slightly related: for a select, chrome triggers mousedown but not click
  // anyways
  window.addEventListener('mouseup', function(e) {
    events.push({
      action: 'click',
      timeStamp: Date.now(),
      x: e.clientX,
      y: e.clientY
    });
  }, true);

  // only `keypress` returns the correct character. `keydown` returns `A` when
  // pressing `a`, etc.
  window.addEventListener('keypress', function(e) {
    // chrome doesn't trigger `keypress` for arrow keys, backspace and delete.
    // ff does. Just handle them apart below in `keydown`
    var code = e.keyCode || e.which;
    // arrow keys
    if (code >= 37 && code <= 40) return;

    // firefox detects backspace and delete on keypress while webkit doesn't
    // we'll delegate to keydown to handle these two keys. We need to treat
    // then as special recorded keys anyways for the selenium replay

    // backspace
    if (code === 8) return;

    // delete key:
    //   keypress:
    //     ff: keyCode 46 and which 0
    //     chrome: not triggered
    //   keydown:
    //     ff: keyCode 46 and which 46
    //     chrome: keyCode 46 and which 46

    // period key:
    //   keypress:
    //     ff: keyCode 0 and which 46
    //     chrome: keyCode 46 and which 46
    //   keydown:
    //     ff: keyCode 190 and which 190
    //     chrome: keyCode 190 and which 190

    if (e.keyCode === 46 && e.which === 0) return;

    // the way dom deals with keydown/press/up and which charCode/keyCode/which
    // we receive is really screwed up. If you google "keyCode charCode which"
    // you'll see why the `or` is here
    events.push({
      action: 'keypress',
      timeStamp: Date.now(),
      key: String.fromCharCode(code)
    });
  }, true);

  // arrow keys are not registered by `keypress` in chrome, so handle them here.
  // They also clash with `&`, `%`, `'` and `(`, so map them to a something
  // readable for now. Will take care of processing this and simulating the
  // keypress correctly in playback mode.
  window.addEventListener('keydown', function(e) {
    var code = e.keyCode || e.which;
    if ((code < 37 || code > 40) && (code !== 8 && code !== 46)) return;
    // treat it as a `keypress` for simplicity during playback simulation
    events.push({
      action: 'keypress',
      timeStamp: Date.now(),
      key: specialKeysMap[code]
    });
  }, true);

  // known issue: doesn't work when scrolling something else than window
  window.addEventListener('scroll', function(e) {
    events.push({
      action: 'scroll',
      timeStamp: Date.now(),
      x: window.scrollX,
      y: window.scrollY
    });
  }, true);

  // TODO: maybe double click and right click in the future, but Selenium
  // support and manual reproduction are shaky
  window._getHuxleyEvents = function() {
    return events;
  };
})();
