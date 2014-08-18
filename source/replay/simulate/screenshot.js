var Promise = require('bluebird');

var browser = require('../../browser/browser');
var cropP = require('../../promisified/cropP');

// the below script unfortunately only works at page initiation time.

// var hideScrollbarScript =
// "var s = document.createElement('style');" +
// "s.id = '_huxleyStyle';" +
// "s.innerHTML =" +
//   "'div::-webkit-scrollbar {-webkit-appearance: none; width: 0 !important;}';" +
// "document.head.appendChild(s);";

// we're gonna have to use this instead. This is only needed in chrome, as ff
// driver doesn't take in the scrollbar when taking screenshot
// note that this doesn't work with inner scrollviews
var hideScrollbarScript =
'window._huxleyOldOverflowVal = document.body.style.overflow;' +
'document.body.style.overflow = "hidden";' +
// setting to `hidden` while scrollbar is shown freezes the scrollbar there.
// Make it disappear by scrolling again. If we're already at the top, scroll
// down then up; otherwise, scroll up then down
'var delta = window.scrollY === 0 ? 1 : -1;' +
'window.scrollTo(window.scrollX, window.scrollY + delta);' +
'window.scrollTo(window.scrollX, window.scrollY - delta);';

var showScrollbarScript =
"if (window._huxleyOldOverflowVal && window._huxleyOldOverflowVal !== '') {" +
"  document.body.style.overflow = _huxleyOldOverflowVal;" +
"} else {" +
"  document.body.style.overflow = 'visible';" +
"}";

var infoScript =
'return [' +
'  window.scrollX, ' +
'  window.scrollY, ' +
'  document.body.scrollWidth, ' +
'  document.body.scrollHeight,' +
'  window.devicePixelRatio > 1' +
'];';

// I want to unfocus the component before taking a screenshot (the hue screws up
// stuff), but focus might trigger other interface changes

function simulateScreenshot(driver, w, h, browserName) {
  var scrollPos;
  var isRetina;
  var rawImageString;

  return browser
    .executeScript(driver, hideScrollbarScript + infoScript)
    .then(function(info) {
      scrollPos = info.slice(0, 4);
      isRetina = info[4];
      return browser.takeScreenshot(driver);
    })
    .then(function(res) {
      rawImageString = res;
      return browser.executeScript(driver, showScrollbarScript);
    })
    .then(function() {
      var left = Math.min(scrollPos[0], scrollPos[2] - w);
      var top = Math.min(scrollPos[1], scrollPos[3] - h);

      var config = {
        left: left < 0 ? 0 : left,
        top: top < 0 ? 0 : top,
        width: w,
        height: h,
      };

      if (browserName === 'chrome') {
        // chrome already takes partial ss. Browser size is adjusted correctly
        // except for width. If it's retina then instead of cropping w, we need
        // to crop w * 2. FF still takes the right dimensions regardless of
        // retina-ness so nothing to adjust here.
        config = {
          left: 0,
          top: 0,
          width: isRetina ? w * 2 : w,
          height: 99999,
        };
      }
      var buf = new Buffer(rawImageString, 'base64');

      return cropP(buf, config);
    });
}

module.exports = simulateScreenshot;
