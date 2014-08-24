# Node-huxley

Test your UI by comparing old and new screenshots.

You made some change to your app and you want to know if you broke the UI. You could either:

- Manually put up some test pages.
- Click and type around and check if everything looks normal (was that padding always there? Did the input box always behave this way? Did the unit test assert on this style?).
- Try to remember whether the new behavior was identical to the one before your change.

Or you could let Huxley automate this for you.

## Installation

```
npm install -g huxley
```

[Selenium Server](http://docs.seleniumhq.org/download/) is used to automate the recorded browser actions. Don't have it yet? Try the [node wrapper](https://github.com/eugeneware/selenium-server).

([Grunt](https://github.com/chenglou/grunt-huxley)/[Gulp](https://github.com/joukou/gulp-huxley) task, if you ever need it).

## Walkthrough

The whole demo lives [here](https://github.com/chenglou/huxley-example).

### Create some UI

[Here's a small app component](https://rawgit.com/chenglou/huxley-example/master/test_page.html). Source code [here](https://github.com/chenglou/huxley-example/blob/master/test_page.html). We're going to use Huxley to make sure the component works every time we make a change to our code. (In reality, you'd set up a test page and bring in your UI script & css.)

### Say what you want to do

We're going to type some text into that input field and toggle the button. Create a `Huxleyfile.json` alongside the component file you just made:

```json
[
  {
    "name": "type",
    "screenSize": [750, 500],
    "url": "http://localhost:8000/test_page.html"
  },
  {
    "name": "toggle button",
    "url": "http://localhost:8000/test_page.html"
  }
]
```

A huxleyfile contains an array of tasks, each of which has a `name`, a `url` and browser `screenSize` (optional, defaults to 1200x795).

### Record your interactions

Start a local server. Try `python -m SimpleHTTPServer` (if you're on Python 3.x: `python -m http.server`) or use [this package](https://github.com/nodeapps/http-server) _(at port 8000)_. Then, start selenium (just type `selenium` in the command line if you got the [node wrapper](https://github.com/eugeneware/selenium-server) already).

`hux --record` to start the recording. By now, a browser window should have popped up. Every time you press `enter`, Huxley records a screenshot of the current browser screen.

- In the command line, press `enter` once to take the initial view of the component.
- Go to the browser, type some text in the input field.
- Back to command line, press `enter` again.
- Press `q`, followed by `enter`, to quit the recording session.

You just finished recording your first task! For the second one, take a screenshot, click the button, take a second screenshot, click the button again, then take a final screenshot, followed by `q` `enter`.

There should be a `Huxleyfolder` created beside your `Huxleyfile.json`. All your browser and command line interactions are recorded there. **Check them into version control.**

### Done!

Let's intentionally introduce some error. In `test_page.html`, change `$(this).toggleClass('btn-primary');` to `$(this).toggleClass('bla')`.

Here's where the magic happens: try `hux` in the command line =).

Enjoy!

### Advanced usage, API & FAQ

All your questions answered in the [wiki](https://github.com/chenglou/node-huxley/wiki).
