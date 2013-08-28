# Node-huxley

A port of the paradigm-shifting front-end "testing" tool, [Huxley](https://github.com/facebook/huxley), to JavaScript.

- Records your actions as you browse.
- Takes screenshots.
- Auto-compares new screenshots against the old ones and checks for differences.

## Modes

### Record

```
hux -r
```

Huxley opens Selenium Webdriver and records your actions. Press `enter` in the terminal to take a snap shot of the screen. When you're done recording your actions and taking your screenshots, press `q` to exit.

### Playback

```
hux
```

Huxley opens the browser again, but this time it'll run the commands you recorded (browser actions and screenshots taking), automatically. When a new screenshot isn't identical to the old one, it stops, warns you and save a diff image for you to examine.

### Update

```
hux -u
```

Same procedure as the playback mode, except this time Huxley replaces your old screenshots with your new ones.

## Installation

```
npm install -g node-huxley
```

You'll need [Selenium Server](http://docs.seleniumhq.org/download/). Starting it is one Java command, documented on their [wiki page](http://code.google.com/p/selenium/wiki/Grid2). Don't want the hassle? Download the [node wrapper](https://github.com/eugeneware/selenium-server) instead.

You'll also need [GraphicsMagick](http://www.graphicsmagick.org). It's used for comparing screenshots (yes, it even works on Windows!).

## Example

In `examples/` you'll find two simple completed Huxley tests.

Let's start recording from scratch by removing `toggle.huxley`, `type.huxley` and `Huxleyfile.json`.

_If you have any Windows-related trouble during the process, see the FAQ below._

`cd` into `examples/webroot` and start a local server. Try `python -m SimpleHTTPServer` (if you're on Python 3.x: `python -m http.server`) or use [this package](https://github.com/nodeapps/http-server).

Create a Huxleyfile.json, like this:

```json
[
  {
    "name": "toggle",
    "screenSize": [1000, 1000],
    "sleepFactor": 0.5,
    "url": "http://localhost:8000/toggle.html"
  },
  {
    "name": "type",
    "url": "http://localhost:8000/type.html"
  }
]
```

Each task is an object. `name` and `url` are mandatory, `sleepFactor` (see below; it accelerates the replay) and `screenSize`. There are no other options =).

Start Selenium (see "Installation" above), it doesn't matter where. `cd` to `examples/` then run `hux -r`. The default Selenium browser is Firefox, and it needs to be in your environment `PATH`. Assuming Selenium started correctly, you should now see a Firefox (the default) window. Now do the following:

- Go back to the terminal, press `enter` to record the initial state of the browser screen.
- Go to browser, click on the button once.
- Terminal again, press `enter`.
- Browser. Click the button again.
- Terminal. Press `enter` one last time, followed by `q` `enter` to quit.

Huxley will then replay your actions as done by itself, then save the screenshots into each task's respective folder.

`hux -p` to see the playback. If you ever feel your actions where too slow, open `Huxleyfile.json` and add the `sleepFactor` to `toggle` and/or `type`. The smaller the faster. Setting it to 0 queues your actions without delay. _Careful though_, if you have animations or other things that require waiting.

Now, say you made a change in `toggle.html`. All you need to do is `hux -u` to update the screenshots automatically.

## Best practices

Node-huxley is a port, so every recommendation [here](https://github.com/facebook/huxley#best-practices) still applies.

## FAQ

### Is this a good idea?

[Instagram](https://github.com/facebook/huxley#huxley) runs on Huxley. They've gotten pretty far with it.

### Where's the documentation?

This readme actually covered every single functionality of node-huxley. Pretty nice isn't it.

### But I like writing front-end unit tests the traditional way!

Woah, really? =) Hop on to the next era of unit testing or we might leave without you!

### I'm on Windows and ______

Make sure that:

- Java is installed and in your environment path.
- Same for Firefox, or whatever browser you want Huxley to open to (coming soon!).
- If the enter key doesn't register while recording, try typing anything (beside `q`) before pressing enter.
