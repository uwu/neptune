import { store } from "voby";
import { createPersistentObject } from "./utils.js";
import quartz from "@uwu/quartz";
import urlImport from "quartz-plugin-url-import";

export const pluginStore = createPersistentObject("NEPTUNE_PLUGINS");
export const enabled = {};

const quartzConfig = {
  plugins: [
    {
      resolve({ name }) {
        if (!name.startsWith("@neptune")) return;

        return `window${name
          .slice(1)
          .split("/")
          .map((i) => `[${JSON.stringify(i)}]`)
          .join("")}`;
      },
    },
    urlImport(),
  ],
};

export function disablePlugin(id) {
  pluginStore[id].enabled = false;

  try {
    enabled[id]?.onUnload?.();
  } catch (e) {
    console.error("Failed to completely clean up neptune plugin!\n", e);
  }

  delete enabled[id];
}

export function togglePlugin(id) {
  return pluginStore[id].enabled ? disablePlugin(id) : enablePlugin(id);
}

export async function enablePlugin(id) {
  pluginStore[id].enabled = true;
  await runPlugin(id, pluginStore[id].code);
}

async function runPlugin(id, code) {
  alert(1)

  try {
    // TODO: fix this quartz bug. no fucking clue what causes this shit.
    const { onUnload } = await quartz(" " + code, quartzConfig);

    enabled[id] = { onUnload: onUnload ?? (() => {}) };
  } catch (e) {
    await disablePlugin(id);

    console.error("Failed to load neptune plugin!\n", e);
  }
}

export async function installPlugin(id, code, manifest, enabled = true) {
  pluginStore[id] = {
    code,
    manifest,
    enabled,
  };

  if (enabled) await runPlugin(id, code);
}

export function removePlugin(id) {
  delete pluginStore[id];
}

// The callback gets called once idb responds and the plugins are loaded into memory.
const doneWaitingForIdb = store.on(pluginStore, () => {
  doneWaitingForIdb();

  // We don't attempt to load plugins if CSP exists because loading every plugin will fail and automatically disable the plugin.
  if (document.querySelector(`[http-equiv="Content-Security-Policy"]`)) return;

  for (const [id, plugin] of Object.entries(pluginStore)) {
    // We do not currently account for plugin updates, but this will be handled once
    // remote plugin installation is handled.
    if (plugin.enabled) runPlugin(id, plugin.code);
  }
});
