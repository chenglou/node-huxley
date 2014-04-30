// Stores info such as current browser, playback mode (update screenshot vs
// comparing), etc.

var config = {};

// Kinda awkward not exporting `config` directly. But I suspect the obj is
// shallow cloned at each require so this wouldn't work.
module.exports = {
  config: config
};
