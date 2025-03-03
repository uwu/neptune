const electron = require("electron");

electron.ipcRenderer.invoke("NEPTUNE_BUNDLE_FETCH").then((bundle) => electron.webFrame.executeJavaScript(bundle));

const createEvalScope = (code, globalName) => electron.ipcRenderer.invoke("NEPTUNE_CREATE_EVAL_SCOPE", code, globalName);
const deleteEvalScope = (id) => electron.ipcRenderer.invoke("NEPTUNE_DELETE_EVAL_SCOPE", id);
const invokeEvalScope = (id, expName, ...args) => electron.ipcRenderer.invoke("NEPTUNE_INVOKE_IN_SCOPE", id, expName, ...args);
const startDebugging = () => electron.ipcRenderer.invoke("NEPTUNE_EVAL", `(() => {process._debugProcess(process.pid);return process.debugPort;})()`);
const eval = (code) => electron.ipcRenderer.invoke("NEPTUNE_EVAL", code);

electron.contextBridge.exposeInMainWorld("NeptuneNative", {
  createEvalScope,
  invokeEvalScope,
  deleteEvalScope,
  startDebugging,
  eval,
});

electron.contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: Object.fromEntries(
    ["on", "off", "once", "addListener", "removeListener", "removeAllListeners", "send", "invoke", "sendSync", "postMessage", "sendToHost"].map((n) => [
      n,
      (...args) => electron.ipcRenderer[n](...args),
    ]),
  ),
});

const originalPreload = electron.ipcRenderer.sendSync("NEPTUNE_ORIGINAL_PRELOAD");
if (originalPreload) require(originalPreload);
