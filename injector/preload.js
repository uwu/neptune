const electron = require("electron");

electron.ipcRenderer.invoke("NEPTUNE_BUNDLE_FETCH").then((bundle) => {
  electron.webFrame.executeJavaScript(bundle);
});

function createEvalScope(code) {
  return electron.ipcRenderer.sendSync("NEPTUNE_CREATE_EVAL_SCOPE", code);
}

function getNativeValue(id, name) {
  if (
    electron.ipcRenderer.sendSync(
      "NEPTUNE_RUN_IN_EVAL_SCOPE",
      id,
      `typeof neptuneExports.${name}`
    ).value == "function"
  )
    return (...args) => {
      funcReturn = electron.ipcRenderer.sendSync(
        "NEPTUNE_RUN_IN_EVAL_SCOPE",
        id,
        `neptuneExports.${name}(${args
          .map((arg) =>
            typeof arg != "function" ? JSON.stringify(arg) : arg.toString()
          )
          .join(",")})`
      );

      if (funcReturn.type == "promise") {
        return new Promise((res, rej) => {
          electron.ipcRenderer.once(funcReturn.value, (ev, { type, value }) => {
            type == "resolve" ? res(value) : rej(value);
          });
        });
      }

      if (funcReturn.type == "error") {
        throw new Error(funcReturn.value);
      }

      return funcReturn.value;
    };

  return electron.ipcRenderer.sendSync(
    "NEPTUNE_RUN_IN_EVAL_SCOPE",
    id,
    `neptuneExports.${name}`
  );
}

function deleteEvalScope(id) {
  return electron.ipcRenderer.sendSync("NEPTUNE_DELETE_EVAL_SCOPE", id);
}

electron.contextBridge.exposeInMainWorld("NeptuneNative", {
  createEvalScope,
  getNativeValue,
  deleteEvalScope,
});

electron.contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: Object.fromEntries(
    [
      "on",
      "off",
      "once",
      "addListener",
      "removeListener",
      "removeAllListeners",
      "send",
      "invoke",
      "sendSync",
      "postMessage",
      "sendToHost",
    ].map((n) => [n, electron.ipcRenderer[n]])
  ),
});

const originalPreload = electron.ipcRenderer.sendSync(
  "NEPTUNE_ORIGINAL_PRELOAD"
);

if (originalPreload) require(originalPreload);
