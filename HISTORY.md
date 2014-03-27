Legend:
  - [I]: improvement
  - [F]: fix
  - [K]: known problems

### 0.7.3 (March 27th 2014)
- [I] Support for third-party drivers, e.g. BrowserStack. See Grunt-huxley's [README](https://github.com/chenglou/grunt-huxley#browserstack).

### 0.7.2 (March 12th 2014)
- [F] Fix output for bad images dimensions also.

### 0.7.1 (March 12th 2014)
- [F] Emergency fix for making diffing work again. Do upgrade. Sorry.

## 0.7.0 (March 10th 2014)
- [I] Display old/new screenshot dimensions when there's a mismatch.
- [I] Remote support! See README or `hux -h`.
- [I] Screenshots are now namespaced with the browser prefix.
- [I] Scrolling support.
- [F] Backspace and delete key.
- [F] Screenshots size actually match `screenSize` now.
- [F] Update dependencies to solve some Selenium-Firefox communication problems.
- [F] Using absolute path with `hux`.
- [K] Chrome still can't get the caret position of an input field from an (x, y).
- [K] Scrolling nested items doesn't work yet. Scroll bar on nested items also screws up because the transparency isn't the same during each playback.
- [K] Scrolling to bottom and capture screenshots leaves a few pixels off.

### 0.6.1 (January 16th 2014)
- [I] Better error handling for invalid browser.
- [F] Make testing in Chrome work again. Sorry.
- [K] The unfocus trick described in the last update doesn't work with Chrome.

## 0.6.0 (December 22th 2013)
- [I] Drop dependency on GraphicsMagick! No more native dependency beside Selenium.
- [I] Faster testing. Huxley reuses the current browser instead of opening a new one each time. This can save up to 300% testing time if your tasks are small and separated, a practice which we encourage, and which now has 0 downside.
- [I] To accelerate the procedure, the recording are done in one batch; only then are playbacks done (also in a batch).
- [I] Way, way better console output:
    - Better path indication.
    - Better formatted messages.
    - Relative path so that it's actually readable.
- [F] New behavior: recorded actions are now played back without the window focus. This is to render consistent the behavior of form input focus. The focus hue used to appear or not depending on whether the browser window had focus. From here onward, the window will be forcefully unfocused before each playback action.

## 0.5.0 (October 16th 2013)
- [I] Better warnings. Always better warnings.
- [I] [Grunt task for huxley](https://github.com/chenglou/grunt-huxley)!
- [I] New way to specify folders in which to search for `Huxleyfile.json`. Basically, just pass one or more flagless arguments. Accepts glob patterns.
- [I] Small Selenium webdriver version bump.

## 0.4.0 (September 10th 2013)
- [I] Batched Huxley automation! `-d` or `--dir` to specify the directory in which `Huxleyfile.json` resides. Can target multiple with glob patterns, etc. Defaults to `**/`, which gets every Huxleyfile in the current directory and every subdirectory.
- [I] More error handling for cli argument errors.
- [F] Optimal default screen size of 1200 x 795: 1200 is the lower limit for what Bootstrap considers as "large screen", and 795 is the max height of Firefox's viewport on MBA 13 inch (actual chromeless screenshot should be 689). This should capture a bigger part of the user base.

### 0.3.3 (September 10th 2013)
- [F] Image diff not yielding warning. Apologies.

### 0.3.2 (September 6th 2013)
- [I] Ability to pick tasks to skip by changing the task's `name` field in `Huxleyfile.json` into `xname`.
- [I] Relevant error messages now include folder locations, to future proof automation of multiple Huxleys via Grunt.

### 0.3.1 (September 1st 2013)
- [F] Playback not doing image comparisons.

## 0.3.0 (September 1st 2013)
- [I] Better error handling/display.
- [I] `record.json` is now extreeemely hackable and readable.
    - Pause (only for real-time playback segments) is now a standalone action and indicate the amount of time to pause rather than a time offset since the beginning of the recording.
    - format actions changed too, check the example `record.json` for the entire coverage.
- [I] Remaining screenshots from previous recording now removed when the new recording contains less screenshots.
- [F] Switch to use Selenium's native click solution, which fixes lots of form input problems.
- [F] Gap-less playback now the default. To record actions in real-time, use `l` `enter`. Check the updated README for more info.
- [F] Removed `sleepFactor`. No longer needed.
- [F] Shorter folder and screenshot names.
- [K] The DOM select problem persists.

## 0.2.0 (August 29th 2013)
- [I] Better error output.
- [F] Behavior when pressing arrow keys.
- [F] Cli parsing bug  for `--browser`/`-b` flag.

### 0.1.3 (August 27th 2013)
- [I] Better error handling/messages. Colors!
- [I] Chrome support.
- [I] Prettified `record.json` for you to hack around.

### 0.1.2 (August 27th 2013)
- [F] New name for npm package.

### 0.1.1 (August 27th 2013)
- [F] Broken examples.

## 0.1.0 (August 27th 2013)
- [I] Better README instructions.
- [I] Removed dependency on gm (GraphicsMagick wrapper).
- [F] Playback now differentiates between lowercase and uppercase keystrokes.

### 0.0.3 (August 27th 2013)
- [F] Totally forgot to expose the bin correctly. Done.

### 0.0.1 (August 27th 2013)
- [F] Made the library a global install.

## 0.0.0 (August 27th 2013)
- Initial public release.
