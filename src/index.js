import { after, instead } from "spitroast";
import "./ui/settings.js";
import "./handleExfiltrations.js";
import windowObject from "./windowObject.js";

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

// Polyfill node setInterval and setTimeout
const delayHandler = (_, resp) => {
  return {
    id: resp,
    unref() {},
  };
};

const clearDelayHandler = ([id], orig) => orig(id?.id ?? id);

after("setInterval", window, delayHandler);
after("setTimeout", window, delayHandler)

instead("clearInterval", window, clearDelayHandler);
instead("clearTimeout", window, clearDelayHandler);


// If the app fails to load for any reason we simply reload the page.
setTimeout(() => {
  if (document.getElementById("skeleton-logged-out")) window.location.reload();
}, 7000);

window.neptune = windowObject;
