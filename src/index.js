import "./ui/settings.js";
import "./handleExfiltrations.js";
import windowObject from "./windowObject.js";

// TODO: Remove this in a future update. 
if (window.require) {
  (async () => {
    const fs = require("fs");
    const path = require("path");

    const indexFetch = await fetch(
      "https://raw.githubusercontent.com/uwu/neptune/master/injector/index.js",
    );
    const preloadFetch = await fetch(
      "https://raw.githubusercontent.com/uwu/neptune/master/injector/preload.js",
    );
    if (!(indexFetch.ok || preloadFetch.ok)) return;

    fs.writeFileSync(path.join(process.resourcesPath, "app", "index.js"), await indexFetch.text());
    fs.writeFileSync(path.join(process.resourcesPath, "app", "preload.js"), await preloadFetch.text());

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
setTimeout(() => {
  if (!windowObject.store) window.location.reload();
}, 7000);

window.neptune = windowObject;
