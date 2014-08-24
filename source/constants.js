module.exports = {
  // optimal default screen size. 1200 is bootstrap's definition of 'large
  // screen' and 795 is a mba 13inch's available height for firefox window in
  // Selenium. The actual height of the chromeless viewport should be 687
  DEFAULT_SCREEN_SIZE: [1200, 687],
  DEFAULT_SERVER_URL_CHROME: 'http://localhost:9515',
  DEFAULT_SERVER_URL_FIREFOX: 'http://localhost:4444/wd/hub',
  DIFF_PNG_SUFFIX: '-diff.png',
  HUXLEYFILE_NAME: 'Huxleyfile.json',
  HUXLEY_FOLDER_NAME: 'Huxleyfolder',
  TASK_FOLDER_SUFFIX: '.hux',
  RECORD_FILE_SUFFIX: '.record.json',

  STEP_CLICK: 'click',
  STEP_KEYPRESS: 'keypress',
  STEP_PAUSE: 'pause',
  STEP_SCREENSHOT: 'screenshot',
  STEP_SCROLL: 'scroll',
  STEP_LIVE_PLAYBACK: 'livePlayback',
};
