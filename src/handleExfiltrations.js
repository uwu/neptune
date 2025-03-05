import windowObject from "./windowObject.js";
import * as patcher from "spitroast";
import { interceptors } from "./api/intercept.js";
import loadStyles from "./styles.js";
import quartz from "@uwu/quartz";

// abandon all hope, ye who enter here

// Main store exfiltration
export let store;

// Built action handlers
export const actions = {};
windowObject.actions = actions;

// Interceptors
windowObject.interceptors = interceptors;

// Module cache
const moduleCache = {};
windowObject.moduleCache = moduleCache;

function resolvePath(basePath, relativePath) {
  // If the relative path starts with '/', it's already an absolute path
  if (relativePath.startsWith("/")) {
    return relativePath; // Return it as is
  }

  // Remove the base name (last part of the base path) to get the base directory
  const baseDir = basePath.replace(/\/[^/]+$/, "");

  // Resolve the relative path against the base directory
  return resolvePathFromBase(baseDir, relativePath);
}

function resolvePathFromBase(baseDir, relativePath) {
  const stack = [];

  // Split the base directory into parts
  const baseParts = baseDir.split("/").filter(Boolean);
  stack.push(...baseParts);

  // Split the relative path into parts
  const parts = relativePath.split("/");

  for (let part of parts) {
    if (part === "" || part === ".") {
      // Ignore empty or current directory ('.')
      continue;
    } else if (part === "..") {
      // Go up one directory if possible
      if (stack.length > 0) {
        stack.pop();
      }
    } else {
      // Otherwise, it's a valid directory/file, add it to the stack
      stack.push(part);
    }
  }

  // Join the parts to form the resolved path, ensuring it starts with '/'
  return "/" + stack.join("/");
}

// promises bubble
const fetchScript = async (path) => (await fetch(path)).text();

const handleResolution = async ({ name, moduleId, config }) => {
  const path = resolvePath(moduleId, name);
  if (moduleCache[path]) return moduleCache[path];

  const data = await fetchScript(path);

  moduleCache[path] = await quartz(data, config, path);
  return moduleCache[path];
};

function findStoreFunctionName(bundleCode) {
  const errorMessageIndex = bundleCode.indexOf('Error("No global store set")');

  if (errorMessageIndex === -1) {
    return null;
  }

  for (let charIdx = errorMessageIndex - 1; charIdx > 0; charIdx--) {
    if (bundleCode[charIdx] + bundleCode[charIdx + 1] != "()") continue;

    let strBuf = [];
    for (let nameIdx = charIdx - 1; nameIdx > 0; nameIdx--) {
      const char = bundleCode[nameIdx];

      if (char == " ") return strBuf.reverse().join("");
      strBuf.push(char);
    }
  }

  return null;
}

function findPrepareActionNameAndIdx(bundleCode) {
  const searchIdx = bundleCode.indexOf(`.payload,..."meta"in `);

  if (searchIdx === -1) {
    return null;
  }

  const sliced = bundleCode.slice(0, searchIdx);
  const funcIndex = sliced.lastIndexOf("{function");

  let strBuf = [];
  for (let nameIdx = bundleCode.slice(0, funcIndex).lastIndexOf("(") - 1; nameIdx > 0; nameIdx--) {
    const char = bundleCode[nameIdx];

    if (char == " ")
      return {
        name: strBuf.reverse().join(""),
        idx: nameIdx + 1,
      };

    strBuf.push(char);
  }
}

setTimeout(async () => {
  for (const script of document.querySelectorAll(`script[type="neptune/quartz"]`)) {
    const scriptPath = new URL(script.src).pathname;
    const scriptContent = await fetchScript(scriptPath);

    // For those reading this code:
    // 1. I'm sorry.
    // 2. quartz is a runtime-based ESM import transformation tool.
    // The reason I'm using it here is because I can have it take over the browser's native ESM import
    // functionality so I can hook the JS that runs on the page to do various things.
    // I have noticed that it seems slower than native browser imports, but it was the easiest solution for me personally.
    moduleCache[scriptPath] = await quartz(
      scriptContent,
      {
        plugins: [
          {
            dynamicResolve: handleResolution,
            async resolve({ name, moduleId, config, accessor, store }) {
              const exports = await handleResolution({ name, moduleId, config });

              store.exports = exports;

              return `${accessor}.exports`;
            },

            transform({ code }) {
              const getStoreFuncName = findStoreFunctionName(code);

              if (getStoreFuncName) code += `; export { ${getStoreFuncName} as hijackedGetStore };`;
              const actionData = findPrepareActionNameAndIdx(code);

              if (actionData) {
                const { name: prepareActionName, idx: prepareActionIdx } = actionData;

                // rename function declaration
                code =
                  code.slice(0, prepareActionIdx) + "$$$NEPTUNE_" + code.slice(prepareActionIdx);

                code =
                  code.slice(0, prepareActionIdx - 9) +
                  `
const $$$NEPTUNE_PATCHED_TEMPOBJ = { patchedFunc: $$$NEPTUNE_${prepareActionName} };
neptune.patcher.after("patchedFunc", $$$NEPTUNE_PATCHED_TEMPOBJ, ([type], resp) => {
  if (!neptune.interceptors[type]) neptune.interceptors[type] = [];
  const [parent, child] = type
    .split("/")
    .map((n) =>
      n.toUpperCase() == n
        ? n
            .toLowerCase()
            .replace(/_([a-z])/g, (_, i) => i.toUpperCase())
        : n,
    );

  const builtAction = (...args) => {
    const act = resp(...args);

    if (!(act.__proto__.toString() == "[object Promise]"))
      return neptune.store.dispatch(act);

    return new Promise(async (res, rej) => {
      try {
        res(neptune.store.dispatch(await act));
      } catch (e) {
        rej(e);
      }
    });
  };

  if (child) {
    if (!neptune.actions[parent]) neptune.actions[parent] = {};

    neptune.actions[parent][child] = builtAction;
  } else {
    neptune.actions[parent] = builtAction;
  }

  return new Proxy(resp, {
    apply(orig, ctxt, args) {
      let shouldDispatch = true;

      for (let interceptor of neptune.interceptors[type]) {
        try {
          const resp = interceptor(args);

          if (resp === true) shouldDispatch = false;
        } catch (e) {
          console.error("Failed to run interceptor!\\n", e);
        }
      }

      return shouldDispatch
        ? orig.apply(ctxt, args)
        : { type: "NOOP" };
    },
  });
});
const ${prepareActionName} = $$$NEPTUNE_PATCHED_TEMPOBJ.patchedFunc;
`.trim() +
                  code.slice(prepareActionIdx - 9);
              }

              return code;
            },
          },
        ],
      },
      scriptPath,
    );

    for (const module of Object.values(moduleCache)) {
      const { hijackedGetStore } = module;

      if (!hijackedGetStore) continue;

      store = hijackedGetStore();
      windowObject.store = store;
    }

    loadStyles();
  }
}, 0);
