module.exports = {
  CHROME_CHROME_SIZE: [0, 72],
  // optimal default screen size. 1200 is bootstrap's definition of 'large
  // screen' and 795 is a mba 13inch's available height for firefox window in
  // Selenium. The actual height of the chromeless viewport should be 687
  DEFAULT_SCREEN_SIZE: [1200, 687],
  DEFAULT_SERVER_URL_CHROME: 'http://localhost:9515',
  DEFAULT_SERVER_URL_FIREFOX: 'http://localhost:4444/wd/hub',
  DEFAULT_SERVER_URL_IPHONE: 'http://localhost:5555/wd/hub',
  DIFF_PNG_NAME: 'diff.png',
  // see explanation in index.js @ _runActionOrDisplaySkipMsg
  FIREFOX_CHROME_SIZE: [0, 106],
  HUXLEYFILE_NAME: 'Huxleyfile.json',
  MODE_COMPARE: 'compare',
  MODE_RECORD: 'record',
  MODE_UPDATE: 'update',
  RECORD_FILE_NAME: 'record.json',
  SCREENSHOTS_FOLDER_EXT: '.hux',
  STEP_CLICK: 'click',
  STEP_KEYPRESS: 'keypress',
  STEP_PAUSE: 'pause',
  STEP_SCREENSHOT: 'screenshot',
  STEP_SCROLL: 'scroll'
};
