var imageOperations = require('../imageOperations');

function simulateScreenshot(driver, screenSize, browserName, next) {
  var dimsAndScrollInfos;

  driver
    .executeScript(
      'return [window.scrollX, window.scrollY, document.body.scrollWidth, document.body.scrollHeight];'
    )
    .then(function(obtainedScrollPos) {
      dimsAndScrollInfos = obtainedScrollPos;
      return driver.takeScreenshot();
    })
    // TODO: isolate the logic for saving image outside of this unrelated step
    .then(function(rawImageString) {
      // see comments in index.js @ _runActionOrDisplaySkipMsg
      var left = Math.min(dimsAndScrollInfos[0], dimsAndScrollInfos[2] - screenSize[0]);
      var top = Math.min(dimsAndScrollInfos[1], dimsAndScrollInfos[3] - screenSize[1]);

      var config = {
        left: left < 0 ? 0 : left,
        top: top < 0 ? 0 : top,
        width: screenSize[0],
        height: screenSize[1]
      };

      if (browserName === 'chrome') {
        // chrome already takes partial ss. Browser size is adjusted correctly
        // except for weight
        config = {
          left: 0,
          top: 0,
          width: screenSize[0],
          height: 99999,
        };
      }
      if (browserName === 'iphone') {
        // iphone has a toolbar and clock at the top of the screen. Screenshots
        // must crop out the clock or it will break image diffs
        config = {
          left: 0,
          top: 140,
          width: screenSize[0],
          height: 99999,
        };
      }
      var imageStream = imageOperations
        .turnRawImageStringIntoStream(rawImageString);

      imageOperations.cropToStream(imageStream, config, next);
    });
}

module.exports = simulateScreenshot;
