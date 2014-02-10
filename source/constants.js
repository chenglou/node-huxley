module.exports = {
  HUXLEYFILE_NAME: 'Huxleyfile.json',
  SCREENSHOTS_FOLDER_EXT: '.hux',
  RECORD_FILE_NAME: 'record.json',
  DIFF_PNG_NAME: 'diff.png',
  STEP_SCREENSHOT: 'screenshot',
  STEP_CLICK: 'click',
  STEP_KEYPRESS: 'keypress',
  STEP_PAUSE: 'pause',
  STEP_SCROLL: 'scroll',
  // optimal default screen size. 1200 is bootstrap's definition of 'large
  // screen' and 795 is a mba 13inch's available height for firefox window in
  // Selenium. The actual height of the chromeless viewport should be 689
  DEFAULT_SCREEN_SIZE: [1200, 795]
};
