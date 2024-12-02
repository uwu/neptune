const electron = require("electron");
const path = require("path");
const Module = require("module");
const fs = require("fs");
const https = require("https");

const logger = new Proxy(console, {
  get: (target, key) =>
    function (...args) {
      return target[key].apply(console, ["[neptune]", ...args]);
    },
});

logger.log("Loading...");

// #region Bundle
const remoteUrl = process.env.NEPTUNE_BUNDLE_URL || "https://raw.githubusercontent.com/uwu/neptune-builds/master/neptune.js";
const localBundle = process.env.NEPTUNE_DIST_PATH;

let fetchPromise; // only fetch once

if (!localBundle)
  fetchPromise = new Promise((resolve, reject) => {
    const req = https.get(remoteUrl);

    req.on("response", (res) => {
      const chunks = [];

      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        let data = Buffer.concat(chunks).toString("utf-8");

        if (!data.includes("//# sourceMappingURL=")) data += `\n//# sourceMappingURL=${remoteUrl + ".map"}`;

        resolve(data);
      });
    });

    req.on("error", reject);

    req.end();
  });

const getNeptuneBundle = () =>
  !localBundle
    ? fetchPromise
    : Promise.resolve(
        fs.readFileSync(path.join(localBundle, "neptune.js"), "utf8") + `\n//# sourceMappingURL=file:////${path.join(localBundle, "neptune.js.map")}`,
      );
// #endregion

// #region IPC
electron.ipcMain.on("NEPTUNE_ORIGINAL_PRELOAD", (event) => {
  event.returnValue = event.sender.originalPreload;
});

electron.ipcMain.handle("NEPTUNE_BUNDLE_FETCH", getNeptuneBundle);
// #endregion

// #region Redux Devtools
electron.app.whenReady().then(() => {
  electron.session.defaultSession.loadExtension(path.join(process.resourcesPath, "app", "redux-devtools"));
});
// #endregion

// #region CSP bypass
electron.app.whenReady().then(() => {
  electron.protocol.handle("https", async (req) => {
    const url = new URL(req.url);
    if (url.pathname === "/" || url.pathname == "/index.html") {
      console.log(req.url);
      const res = await electron.net.fetch(req, { bypassCustomProtocolHandlers: true });
      let body = await res.text();
      body = body.replace(/<meta http-equiv="Content-Security-Policy" content=".*?">/, "<!-- neptune removed csp -->");
      return new Response(body, res);
    }
    return electron.net.fetch(req, { bypassCustomProtocolHandlers: true });
  });
  // Force service worker to fetch resources by clearing it's cache.
  electron.session.defaultSession.clearStorageData({
    storages: ["cachestorage"],
  });
});
// #endregion

// #region Stylesheet bypass
electron.app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders, resourceType }, cb) => {
    if (responseHeaders && resourceType === "stylesheet") {
      const header = Object.keys(responseHeaders).find((h) => h.toLowerCase() === "content-type") || "content-type";
      responseHeaders[header] = "text/css";
    }
    cb({ cancel: false, responseHeaders });
  });
});
// #endregion

// #region IPC Bullshit
const evalHandles = {};
let scopeId = 0;
electron.ipcMain.handle("NEPTUNE_EVAL", (_, code) => eval(code));
electron.ipcMain.handle("NEPTUNE_INVOKE_IN_SCOPE", (_, _scopeId, expName, ...args) => evalHandles[_scopeId][expName](...args));
electron.ipcMain.handle("NEPTUNE_CREATE_EVAL_SCOPE", (_, code, globalName) => {
  // Extract the exports from the global and store them to be called
  evalHandles[++scopeId] = eval(`(() => {${code};return ${globalName};})()`);
  return scopeId;
});
electron.ipcMain.handle("NEPTUNE_DELETE_EVAL_SCOPE", (_, id) => {
  delete evalHandles[id];
});
// #endregion

// #region BrowserWindow
const ProxiedBrowserWindow = new Proxy(electron.BrowserWindow, {
  construct(target, args) {
    const options = args[0];
    let originalPreload;

    // tidal-hifi does not set the title, rely on dev tools instead.
    const isTidalWindow = options.title == "TIDAL" || options.webPreferences?.devTools;

    if (isTidalWindow) {
      originalPreload = options.webPreferences?.preload;
      // We replace the preload instead of using setPreloads because of some
      // differences in internal behaviour.
      options.webPreferences.preload = path.join(__dirname, "preload.js");

      // Shhh. I can feel your judgement from here. It's okay. Let it out. Everything will be alright in the end.
      // options.webPreferences.contextIsolation = false;
      // options.webPreferences.nodeIntegration = true;
      options.webPreferences.sandbox = false;

      // Allows local plugin loading
      options.webPreferences.allowDisplayingInsecureContent = true;
      options.webPreferences.allowRunningInsecureContent = true;
    }

    const window = new target(options);
    if (!isTidalWindow) return window;

    window.webContents.originalPreload = originalPreload;

    window.webContents.on("did-navigate", () => {
      // Clean up eval handles
      evalHandles = {};
    });

    return window;
  },
});

const electronPath = require.resolve("electron");
delete require.cache[electronPath].exports;
require.cache[electronPath].exports = {
  ...electron,
  BrowserWindow: ProxiedBrowserWindow,
};
// #endregion

// #region Restore DevTools
const originalBuildFromTemplate = electron.Menu.buildFromTemplate;
electron.Menu.buildFromTemplate = (template) => {
  template.push({
    role: "toggleDevTools",
    visible: false,
  });

  return originalBuildFromTemplate(template);
};
// #endregion

// #region Start original
logger.log("Starting original...");

let originalPath = path.join(process.resourcesPath, "app.asar");
if (!fs.existsSync(originalPath)) originalPath = path.join(process.resourcesPath, "original.asar");

const originalPackage = require(path.resolve(path.join(originalPath, "package.json")));
const startPath = path.join(originalPath, originalPackage.main);

require.main.filename = startPath;
electron.app.setAppPath?.(originalPath);
electron.app.name = originalPackage.name;

Module._load(startPath, null, true);
// #endregion
