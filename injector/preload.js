const { ipcRenderer, webFrame } = require("electron");

ipcRenderer.invoke("NEPTUNE_BUNDLE_FETCH").then((bundle) => {
  webFrame.executeJavaScript(bundle);
});

const originalPreload = ipcRenderer.sendSync("NEPTUNE_ORIGINAL_PRELOAD");
if (originalPreload) require(originalPreload);