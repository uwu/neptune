import "./ui/settings.js";
import "./handleExfiltrations.js";
import windowObject from "./windowObject.js";


// Updater 3
if (NeptuneNative.VITE_ACTIVE != true) {
  (async () => {
    const fsScope = NeptuneNative.createEvalScope(`
      const fs = require("fs");
      const path = require("path");
      
      var neptuneExports = {
        updateFile(name, contents) {
          fs.writeFileSync(path.join(process.resourcesPath, "app", name), contents);
        }
      }
    `);
  
    const updateFile = NeptuneNative.getNativeValue(fsScope, "updateFile");
  
    const indexFetch = await fetch(
      "https://raw.githubusercontent.com/uwu/neptune/master/injector/index.js",
    );
    const preloadFetch = await fetch(
      "https://raw.githubusercontent.com/uwu/neptune/master/injector/preload.js",
    );

    if (!(indexFetch.ok || preloadFetch.ok)) return;

    updateFile("index.js", await indexFetch.text())
    updateFile("preload.js", await preloadFetch.text())

    alert("neptune has been updated. Please restart TIDAL.");
  })()
}

// Restore the console
for (let key in console) {
  const orig = console[key];

  Object.defineProperty(console, key, {
    set() {
      return true;
    },
    get() {
      return orig;
    },
  });
}

// Force properties to be writable for patching
const originalDefineProperty = Object.defineProperty;

Object.defineProperty = function (...args) {
  args[2].configurable = true;

  try {
    return originalDefineProperty.apply(this, args);
  } catch {}
};

Object.freeze = (arg) => arg;

// If the app fails to load for any reason we simply reload the page.
// setTimeout(() => {
//   if (!windowObject.store) window.location.reload();
// }, 7000);

window.neptune = windowObject;
