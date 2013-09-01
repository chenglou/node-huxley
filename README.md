# Node-huxley

A port of the codeless front-end codeless testing tool, [Huxley](https://github.com/facebook/huxley), used by Instagram.

- Records your actions as you browse.
- Takes screenshots.
- Compares new screenshots against the old ones and checks for differences.

## Installation

```
npm install -g huxley
```

You'll also need [GraphicsMagick](http://www.graphicsmagick.org), used for comparing screenshots (works on Windows too!).

[Selenium Server](http://docs.seleniumhq.org/download/) is used to automate the recorded browser actions. If you already have it, skip this. Don't have it and don't want the hassle of managing it? Download the [node wrapper](https://github.com/eugeneware/selenium-server) instead.

## Walkthrough and API

The API's so short it didn't warrant its own section. The example below uses every feature of Huxley.

### Testing the water

In `examples/` you'll find two simple completed Huxley tests. You can immediately run `hux` in that folder and see what our final results look like.

Let's restart from beginning by removing everything _but_ the `webroot/` folder. _If you have any Windows or browser issue during the process, see the FAQ below._

`cd` into `webroot/` and start a local server. Try `python -m SimpleHTTPServer` (if you're on Python 3.x: `python -m http.server`) or use [this package](https://github.com/nodeapps/http-server) _(at port 8000)_.

Back in `examples/`, Create a `Huxleyfile.json`, like this:

```json
[
  {
    "name": "toggle",
    "screenSize": [1000, 600],
    "url": "http://localhost:8000/component.html"
  },
  {
    "name": "type",
    "url": "http://localhost:8000/component.html"
  }
]
```

Each task is an object. Only `name` and `url` are mandatory and `screenSize` is the only other option. It's a good idea to test only one component inside one `Huxleyfile`, but to separate each aspect of the component into its respective task.

Start Selenium (see "Installation" above), it doesn't matter where. Now run `hux -r` (for a complete list of options, do `hux -h`) to start recording. The default Selenium browser is Firefox, **see FAQ if you're having trouble/want to use another browser.** Assuming Selenium started correctly, do the following:

- Go to the terminal, press `enter` to record the initial state of the browser screen.
- Go to browser, click on the text field and type 'Hello World'.
- Back to terminal again, press `enter` to take a second screenshot.
- Back to browser, click on the checkbox.
- Back to terminal one last time, `enter` to take a third screenshot.
- Now press `q` `enter` to quit.

Huxley will then replay your actions as done by itself, then save the screenshots into the task's folder. You'll notice that your actions are chained immediately one after another without delay, as to reduce the time wasted in-between.

Now you finished your first task and Huxley's already opened the browser again and waiting for your second task. Pause for a second and read on.

### "l" for "live"

The web landscape is getting more and more animated, and the way Huxley chains your recorded actions without delay doesn't work well when UI elements transition on your page. Fortunately, there's a special switch for this.

You're now onto your second task. The browser should still be open, waiting for your input.

- Go to terminal, `l` `enter`. This will not only capture a screenshot, but ask Huxley, when it does its playback, to consider everything from this point forward until the next screenshot as a live playback, e.g. respect the user action's timeline.
- Click on `Launch modal`.
- Terminal: `l` `enter` again, as we'll be dismissing the modal and want to take the screenshot only after the transition's done.
- Browser: click anywhere to dismiss the modal.
- Terminal: `enter` to take a regular screenshot, then `q` `enter` to quit.

That's it! After Huxley replays this task, feel free to examine the replay again with `hux`, or to update the replay when you make changes in the future with `hux -u`.

### One more thing

The `record.json` file Huxley uses for the playback is completely hackable and optimized for reading. Feel free to tweak it!

## Philosophy and best practices

Node-huxley is a port, so every recommendation [here](https://github.com/facebook/huxley#best-practices) still applies.

## FAQ

### How do I switch the default browser?

Currently, only Firefox and Chrome are supported. For Chrome, you need [chromedriver](https://code.google.com/p/chromedriver/downloads/list), which doesn't come bundled with Selenium yet. Start that then do:

```
hux -b chrome -flagForWhateverElseYouNeed
```

### I'm on Windows and ______

Make sure that:

- Java is installed and in your environment path.
- If the enter key doesn't register while recording, try typing anything (beside the reserved `q` or `l`) before pressing enter.

### But I like writing front-end unit tests the traditional way!

Woah, really? =) Hop on to the next era of unit testing or we might leave without you!
