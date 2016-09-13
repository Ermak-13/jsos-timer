var Widget = require('./widget'),
    Shortcut = require('./shortcut'),
    locales = require('./locales');

global.I18n.registryDict(locales);
global.OS.installModule('Timer',{
  Widget: Widget,
  Shortcut: Shortcut
});
