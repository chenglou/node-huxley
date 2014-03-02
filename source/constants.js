module.exports = {
  // optimal default screen size. 1200 is bootstrap's definition of 'large
  // screen' and 795 is a mba 13inch's available height for firefox window in
  // Selenium. The actual height of the chromeless viewport should be 689
  DEFAULT_SCREEN_SIZE: [1200, 795],
  DEFAULT_SERVER_URL_FIREFOX: 'http://localhost:4444/wd/hub',
  DEFAULT_SERVER_URL_CHROME: 'http://localhost:9515',
  DIFF_PNG_NAME: 'diff.png',
  HUXLEYFILE_NAME: 'Huxleyfile.json',
  RECORD_FILE_NAME: 'record.json',
  SCREENSHOTS_FOLDER_EXT: '.hux',
  STEP_CLICK: 'click',
  STEP_KEYPRESS: 'keypress',
  STEP_PAUSE: 'pause',
  STEP_SCREENSHOT: 'screenshot',
  STEP_SCROLL: 'scroll'
};
