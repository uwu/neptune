import windowObject from "./windowObject.js";
import * as patcher from "spitroast";
import { interceptors } from "./api/intercept.js";
import loadStyles from "./styles.js";

// abandon all hope, ye who enter here

/*
  This code runs before webpackChunk_tidal_web is defined.
  Upon it being assigned to, we patch push to intercept webpackRequire and exfiltrate modules.
  The upcoming comments will explain each step of the process.
*/

// Variables used for hooking into webpack.
let patchedPush = false;
let webpackObject;

// Exfiltrations gained from hooking into webpack.
let patchedPrepareAction = false;
let exfiltratedStore;

// Built action handlers
export const actions = {};
windowObject.actions = actions;

const getModulesFromWpRequire = (wpRequire) =>
  Object.fromEntries(
    Object.entries(wpRequire.m).map(([k]) => [k, { id: k, loaded: true, exports: wpRequire(k) }]),
  );

Object.defineProperty(window, "webpackChunk_tidal_web", {
  get: () => webpackObject,
  set(val) {
    if (webpackObject) return true;

    loadStyles();

    webpackObject = val;

    const originalPush = webpackObject.push;
    let newPush;
    Object.defineProperty(webpackObject, "push", {
      set(v) {
        if (!newPush) newPush = v;
      },
      get: () =>
        newPush
          ? function () {
              try {
                for (const chunk of arguments) {
                  const [, modules] = chunk;
                  if (!modules) continue;

                  for (const moduleId in modules) {
                    const originalModule = modules[moduleId];

                    modules[moduleId] = function () {
                      const wpRequire = arguments[2];

                      if (!windowObject.hasOwnProperty("modules"))
                        Object.defineProperty(windowObject, "modules", {
                          get: () => Object.values(getModulesFromWpRequire(wpRequire)),
                        });

                      // thinking i'll add a try { } catch { } finally { } to this.
                      arguments[2] = new Proxy(wpRequire, {
                        apply(target, thisArg, args) {
                          const originalResponse = target.apply(thisArg, args);
                          if (typeof originalResponse != "object") return originalResponse;

                          // neptune.store exfiltration code
                          try {
                            if (!exfiltratedStore) {
                              const [key] = Object.entries(originalResponse).find(([, e]) =>
                                e?.toString?.().includes?.('Error("No global store set"'),
                              );

                              if (key) exfiltratedStore = true;

                              const unpatch = patcher.after(key, originalResponse, (_, resp) => {
                                if (!typeof resp == "object" && windowObject.store) return;

                                windowObject.store = resp;
                                unpatch();
                              });
                            }
                          } catch {}

                          // neptune.intercept setup code
                          try {
                            if (patchedPrepareAction) return originalResponse;

                            let found = Object.entries(originalResponse).find(
                              ([, possiblyPrepareAction]) =>
                                possiblyPrepareAction
                                  ?.toString?.()
                                  ?.includes?.(
                                    `new Error("prepareAction did not return an object");`,
                                  ),
                            );

                            if (!found) return originalResponse;

                            patchedPrepareAction = true;

                            patcher.after(found[0], originalResponse, ([type], resp) => {
                              if (!interceptors[type]) interceptors[type] = [];

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
                                  return windowObject.store.dispatch(act);

                                return new Promise(async (res, rej) => {
                                  try {
                                    res(windowObject.store.dispatch(await act));
                                  } catch (e) {
                                    rej(e);
                                  }
                                });
                              };

                              if (child) {
                                if (!actions[parent]) actions[parent] = {};

                                actions[parent][child] = builtAction;
                              } else {
                                actions[parent] = builtAction;
                              }

                              return new Proxy(resp, {
                                apply(orig, ctxt, [payload]) {
                                  try {
                                    let shouldDispatch = true;

                                    const interceptorData = [payload, type];

                                    for (let interceptor of interceptors[type]) {
                                      try {
                                        const resp = interceptor(interceptorData);

                                        if (resp === true) shouldDispatch = false;
                                      } catch (e) {
                                        console.error("Failed to run interceptor!\n", e);
                                      }
                                    }

                                    return shouldDispatch
                                      ? orig.apply(ctxt, [interceptorData[0]])
                                      : { type: "NOOP" };
                                  } catch (e) {
                                    console.log(e);
                                  }
                                },
                              });
                            });
                          } catch {}

                          return originalResponse;
                        },
                      });

                      return originalModule.apply(this, arguments);
                    };
                  }
                }
              } catch (e) {
                console.error("[neptune] failed to hook properly", e);
              }

              return newPush.apply(this, arguments);
            }
          : originalPush,
    });
  },
});
