const electron = require("electron");

const electronPath = require.resolve("electron");
delete require.cache[electronPath].exports;

// God, have mercy on my soul. I'm so sorry.
require.cache[electronPath].exports = {
  ...electron,
  contextBridge: {
    exposeInMainWorld(name, properties) {
      window[name] = properties;
    },
  },
};

electron.ipcRenderer.invoke("NEPTUNE_BUNDLE_FETCH").then((bundle) => {
  electron.webFrame.executeJavaScript(bundle);
});

const originalPreload = electron.ipcRenderer.sendSync("NEPTUNE_ORIGINAL_PRELOAD");
if (originalPreload) require(originalPreload);