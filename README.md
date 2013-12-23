# Node-huxley

A port of the codeless front-end testing tool, [Huxley](https://github.com/facebook/huxley), used by Instagram.

- Records your actions as you browse.
- Takes screenshots.
- Compares new screenshots against the old ones and checks for differences.

[Grunt task here](https://github.com/chenglou/grunt-huxley).

## Installation

```
npm install -g huxley
```

[Selenium Server](http://docs.seleniumhq.org/download/) is used to automate the recorded browser actions. If you already have it, skip this. Don't have it and don't want the hassle of managing it? Download the [node wrapper](https://github.com/eugeneware/selenium-server) instead.

## Walkthrough and API

`hux -h` for a list of the available commands.

The API's so short it didn't warrant its own section. This example covers every feature of Huxley. _If you have any Windows or browser issue during the process, see the FAQ below._

In `examples/` you'll find two completed Huxley tests; we'll reproduce them below.

### Testing the water

Let's start `examples/` from scratch by removing everything _but_ the `webroot/` folder. We'll be testing `component.html`. Take a look.

`cd` into `webroot/` and start a local server. Try `python -m SimpleHTTPServer` (if you're on Python 3.x: `python -m http.server`) or use [this package](https://github.com/nodeapps/http-server) _(at port 8000)_.

Back in `examples/`, create a `Huxleyfile.json`, like this:

```json
[
  {
    "name": "toggle",
    "screenSize": [1000, 600],
    "url": "http://localhost:8000/component.html"
  },
  {
    "xname": "type",
    "url": "http://localhost:8000/component.html"
  }
]
```

Each task is an object. Only `name` and `url` are mandatory and `screenSize` is the only other option. **Note that the second task is marked as `xname`**. This means that the task will be skipped. We'll focus on the first one for now.

Start Selenium (see "Installation" above), it doesn't matter where. Now run `hux -r` to start recording. The default Selenium browser is Firefox. Assuming Selenium started correctly, do the following:

- Go to the terminal, press `enter` to record a first browser screenshot.
- Go to the browser, click on the text field and type 'Hello World'.
- Back to the terminal again, press `enter` to take a second screenshot.
- Back to the browser, click on the checkbox.
- Back to the terminal one last time, `enter` to take a third screenshot.
- Now press `q` `enter` to quit.

Huxley will then replay your actions and save the screenshots into a folder (notice that your actions are chained one after another without delay for a faster test experience).

Onward!

### "l" for "live"

When you do need delays between actions for animations or AJAX, you can activate a special switch.

Open `Huxleyfile.json` again. Change the first task's `name` key into `xname` and the second one's `xname` into `name` (i.e. we'll skip the first task and run the second one). Run `hux -r` again:

- Go to the terminal, `l` `enter`. This will capture a screenshot **and** mark a **l**ive playback point. From this point to the next `enter`, Huxley will respect the delay between your actions.
- Browser: click on `Launch modal`.
- Terminal: `l` `enter` again, as we'll be dismissing the modal and want to take the screenshot only after the transition's done.
- Browser: click anywhere to dismiss the modal.
- Terminal: `enter` to take a regular screenshot (thus marking the end of earlier's live playback), then `q` `enter` to quit.

That's it! Check your replay and _Don't forget to remove the `x` in `xname` of `Huxleyfile.json`_.

When you modify your code in the future, `hux` to compare the new screenshots against the old ones and `hux -u` to update them. **If you want to batch run Huxleyfiles, see `hux --help`**.

## FAQ

### What are the best practices?

Node-huxley is a port, so every recommendation [here](https://github.com/facebook/huxley#best-practices) still applies.

### How do I switch the default browser?

Currently, only Firefox and Chrome are supported. For Chrome, you need [chromedriver](https://code.google.com/p/chromedriver/downloads/list), which doesn't come bundled with Selenium yet. Start that then do:

```
hux -b chrome -flagForWhateverElseYouNeed
```

### I'm on Windows and ______

Make sure that:

- Java is installed and in your environment path.
- If the enter key doesn't register while recording, try typing anything (beside the reserved `q` or `l`) before pressing enter.
- If you're using the `--file` flag, use only forward slashes (`/`) in your pattern.
