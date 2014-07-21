var Promise = require('bluebird');

var browser = require('../../browser/browser');

var rawScript = function($x, $y) {
  var el = document.elementFromPoint($x, $y);
  el.focus();

  if ((el.tagName === 'TEXTAREA' || el.tagName === 'INPUT')) {
    var range;
    var offset;
    if (document.caretPositionFromPoint) {
      // ff
      range = document.caretPositionFromPoint($x, $y);
      offset = range.offset;
    } else {
      // chrome
      // this actually doesn't work (chrome bug). It'll always select the end of
      // the textfield. We leave it here in case it's fixed in the future
      range = document.caretRangeFromPoint($x, $y);
      offset = range.startOffset + 99999;
    }
    el.setSelectionRange(offset, offset);
  }

  var evt = document.createEvent('MouseEvents');
  evt.initMouseEvent('click', true, true, window, 1, 0, 0, $x, $y, false, false, false, false, 0, null);
  el.dispatchEvent(evt);
  return el;
}.toString();

var script = rawScript
  .slice(rawScript.indexOf('{') + 1, rawScript.lastIndexOf('}'));

// TODO: handle friggin select menu click, can't right now bc browsers
function simulateClick(driver, posX, posY) {
  return browser
    .executeScript(
      driver,
      script.replace(/\$x/g, posX).replace(/\$y/g, posY)
    )
    .then(function(el) {
      return Promise.resolve();
      // selenium click at weird places I haven't bothered to figure out why
      // I don't know what the advantage of its click is currently, but I intend
      // to levarage js for this as much as I can

      // one known bug is that the dropdown menus are native OS components and
      // can't be clicked through either js or selenium. We'll have to hack that
      // in js

      // return el.click();
    });
}

module.exports = simulateClick;
