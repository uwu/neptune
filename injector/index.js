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
const remoteUrl =
  process.env.NEPTUNE_BUNDLE_URL ||
  "https://raw.githubusercontent.com/uwu/neptune-builds/master/neptune.js";
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

        if (!data.includes("//# sourceMappingURL="))
          data += `\n//# sourceMappingURL=${remoteUrl + ".map"}`;

        resolve(data);
      });
    });

    req.on("error", reject);

    req.end();
  });

const getShelterBundle = () =>
  !localBundle
    ? fetchPromise
    : Promise.resolve(
        fs.readFileSync(path.join(localBundle, "neptune.js"), "utf8") +
          `\n//# sourceMappingURL=file:////${path.join(
            localBundle,
            "neptune.js.map"
          )}`
      );
// #endregion

// #region IPC
electron.ipcMain.on("NEPTUNE_ORIGINAL_PRELOAD", (event) => {
  event.returnValue = event.sender.originalPreload;
});

electron.ipcMain.handle("NEPTUNE_BUNDLE_FETCH", getShelterBundle);
// #endregion

// #region Redux Devtools
electron.app.on("ready", () => {
  electron.session.defaultSession.loadExtension(
    path.join(process.resourcesPath, "app", "redux-devtools")
  );
});
// #endregion

// #region BrowserWindow
const ProxiedBrowserWindow = new Proxy(electron.BrowserWindow, {
  construct(target, args) {
    const options = args[0];
    let originalPreload;

    if (options.webPreferences?.preload && options.title) {
      originalPreload = options.webPreferences.preload;
      // We replace the preload instead of using setPreloads because of some
      // differences in internal behaviour.
      options.webPreferences.preload = path.join(__dirname, "preload.js");
    }

    const window = new target(options);
    if (options.title != "TIDAL") return;

    window.webContents.once("did-finish-load", () => {
      electron.protocol.interceptBufferProtocol("https", ({ url }, cb) => {
        if (url == "https://desktop.tidal.com/") electron.protocol.uninterceptProtocol("https");
  
        https.get(url, (res) => {
          const data = [];
          res.on("data", (chunk) => data.push(chunk));
          res.on("end", () => {
            const buffer = Buffer.concat(data);
            const str = buffer.toString("utf8");
  
            cb(
              Buffer.from(
                str.replace(
                  `<meta http-equiv="Content-Security-Policy"`,
                  "<meta"
                ),
                "utf8"
              )
            );
          });
        });
      });

      window.webContents.reloadIgnoringCache()
    })
    

    window.webContents.originalPreload = originalPreload;
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
  const view = template.find((m) => m.label == "View");
  if (view) view.submenu.push({ role: "toggleDevTools" });

  return originalBuildFromTemplate(template);
};
// #endregion

logger.log("Starting original...");
// #region Start original
let originalPath = path.join(process.resourcesPath, "app.asar");
if (!fs.existsSync(originalPath))
  originalPath = path.join(process.resourcesPath, "original.asar");

const originalPackage = require(path.resolve(
  path.join(originalPath, "package.json")
));
const startPath = path.join(originalPath, originalPackage.main);

require.main.filename = startPath;
electron.app.setAppPath?.(originalPath);
electron.app.name = originalPackage.name;

Module._load(startPath, null, true);
// #endregion
