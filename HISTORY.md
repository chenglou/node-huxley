### 0.3.3 (September 10th 2013)
- Fix image diff not yielding warning. Apologies.

### 0.3.2 (September 6th 2013)
- Ability to pick tasks to skip by changing the task's `name` field in `Huxleyfile.json` into `xname`.
- Relevant error messages now include folder locations, to future proof automation of multiple Huxleys via Grunt.

### 0.3.1 (September 1st 2013)
- Playback not doing image comparisons. Fixed it.

## 0.3.0 (September 1st 2013)
- Switch to use Selenium's native click solution, which fixes lots of form input problems. The select problem persists.
- Gap-less playback now the default. To record actions in real-time, use `l` `enter`. Check the updated README for more info.
- Removed `sleepFactor`. No longer needed.
- Shorter folder and screenshot names.
- Remaining screenshots from previous recording now removed when the new recording contains less screenshots.
- Better error handling/display.
- `record.json` is now extreeemely hackable and readable.
    - Pause (only for real-time playback segments) is now a standalone action and indicate the amount of time to pause rather than a time offset since the beginning of the recording.
    - format actions changed too, check the example `record.json` for the entire coverage.

## 0.2.0 (August 29th 2013)
- Fix behavior when pressing arrow keys.
- Better error output.
- Fix cli parsing bug  for `--browser`/`-b` flag.

### 0.1.3 (August 27th 2013)
- Chrome support.
- Better error handling/messages. Colors!
- Prettified `record.json` for you to hack around.

### 0.1.2 (August 27th 2013)
- New name for npm package.

### 0.1.1 (August 27th 2013)
- Fix broken examples.

## 0.1.0 (August 27th 2013)
- Better README instructions.
- Playback now differentiates between lowercase and uppercase keystrokes.
- Removed dependency on gm (GraphicsMagick wrapper).

### 0.0.3 (August 27th 2013)
- Totally forgot to expose the bin correctly. Done.

### 0.0.1 (August 27th 2013)
- Made the library a global install.

## 0.0.0 (August 27th 2013)
- Initial public release.
