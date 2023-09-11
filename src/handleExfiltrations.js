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

    /*
      We replace webpackObject with a proxy that waits for .push to be gotten.
      This could be replaced with an Object.defineProperty call that assigns push to a getter,
      but I didn't feel like it. Fuck you.
    */
    webpackObject = new Proxy(val, {
      get(obj, prop) {
        if (prop == "push" && !patchedPush) {
          patchedPush = true;

          // This patcher call patches .push.
          patcher.before(prop, obj, (args) => {
            // Push can be called with multiple chunks, so instead of only doing the first argument we handle all of them.
            for (let arg of args) {
              if (!arg[1]) continue;

              // Each chunk contains an object containing a list of modules, so we iterate over each module id.
              for (let id in arg[1]) {
                // Modules get passed webpackRequire as their third argument, so we patch over each module to essentially patch webpackRequire.
                patcher.before(id, arg[1], (args) => {
                  const wpRequire = args[2];

                  if (!windowObject.hasOwnProperty("modules"))
                    Object.defineProperty(windowObject, "modules", {
                      get: () => Object.values(getModulesFromWpRequire(wpRequire)),
                    });

                  // See above: patching webpackRequire.
                  patcher.after(2, args, (_, resp) => {
                    try {
                      /*
                        This entire block exfiltrates modules we need / patches them.
                        The only modules we need export an object, so we return if they aren't an object.
                      */
                      if (typeof resp != "object") return;

                      try {
                        if (!exfiltratedStore) {
                          // We sift through the modules to find a module that exports a function that gets the global Redux store.
                          const [key] = Object.entries(resp).find(([, e]) =>
                            e?.toString?.().includes?.('Error("No global store set"'),
                          );

                          if (key) exfiltratedStore = true;

                          /*
                            Because we patch so early, the global Redux store is not defined yet,
                            so we wait for the getStore function to be called.
                          */
                          patcher.after(key, resp, (_, resp) => {
                            if (!typeof resp == "object" && windowObject.store) return;

                            windowObject.store = resp;
                          });
                        }
                      } catch {}

                      try {
                        if (patchedPrepareAction) return;

                        let found = Object.entries(resp).find(([, possiblyPrepareAction]) =>
                          possiblyPrepareAction
                            ?.toString?.()
                            ?.includes?.(`new Error("prepareAction did not return an object");`),
                        );

                        if (!found) return;

                        patchedPrepareAction = true;
                        patcher.after(found[0], resp, ([type], resp) => {
                          if (!interceptors[type]) interceptors[type] = [];

                          const [parent, child] = type
                            .split("/")
                            .map((n) =>
                              n.toUpperCase() == n
                                ? n.toLowerCase().replace(/_([a-z])/g, (_, i) => i.toUpperCase())
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

                              return shouldDispatch ? orig.apply(ctxt, interceptorData[0]) : { type: "NOOP" };
                            },
                          });
                        });
                      } catch {}
                    } catch (e) {
                      console.error(e);
                    }
                  });
                });
              }
            }
          });
        }

        return obj[prop];
      },
    });

    return true;
  },
});
