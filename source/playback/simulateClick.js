// TODO: handle friggin select menu click, can't right now bc browsers
function simulateClick(driver, posX, posY, next) {
  var posString = '(' + posX + ', ' + posY + ')';

  driver
    // TODO: isolate this into a script file clicking on an input/textarea
    // element focuses it but doesn't place the carret at the correct position;
    // do it here (only works for ff)
    .executeScript(
      'var el = document.elementFromPoint' + posString + ';' +
      'if ((el.tagName === "TEXTAREA" || el.tagName === "INPUT") && document.caretPositionFromPoint) {' +
        'var range = document.caretPositionFromPoint' + posString + ';' +
        'var offset = range.offset;' +
        'document.elementFromPoint' + posString + '.setSelectionRange(offset, offset);' +
      '}' +
      'return document.elementFromPoint' + posString + ';'
    )
    .then(function(el) {
      el.click();
    })
    .then(next);
}

module.exports = simulateClick;
