import { store } from "voby";
import { createPersistentObject, neptuneIdbStore } from "./utils.js";
import { del } from "idb-keyval";
import quartz from "@uwu/quartz";
import urlImport from "quartz-plugin-url-import";
import { actions } from "../handleExfiltrations.js";

export const [pluginStore, pluginStoreReady] = createPersistentObject("NEPTUNE_PLUGINS");
export const enabled = store({});

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
  try {
    const [persistentStorage, persistentStorageReady] = createPersistentObject(
      id + "_PERSISTENT_STORAGE",
    );

    await persistentStorageReady;

    const pluginData = {
      manifest: pluginStore[id].manifest,
      persist: persistentStorage,
      id,
    };

    const { onUnload, Settings } = await quartz(code, {
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
        {
          resolve({ name, store, accessor }) {
            if (!name.startsWith("@plugin")) return;

            if (!store.plugin) store.plugin = { ...pluginData, default: pluginData };

            return `${accessor}${name
              .slice(1)
              .split("/")
              .map((i) => `[${JSON.stringify(i)}]`)
              .join("")}`;
          },
        },
        urlImport(),
      ],
    });

    enabled[id] = { onUnload: onUnload ?? (() => {}) };
    if (Settings) enabled[id].Settings = Settings;
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

export async function removePlugin(id) {
  delete pluginStore[id];
  await del("_PERSISTENT_STORAGE", neptuneIdbStore);
}

// This handles caching too!
export async function fetchPluginFromURL(url) {
  let parsedURL = url;

  if (!parsedURL.endsWith("/")) parsedURL += "/";

  const manifest = await (await fetch(parsedURL + "manifest.json", { cache: "no-store" })).json();
  if (!["name", "author", "description", "hash"].every((i) => typeof manifest[i] === "string"))
    throw "Manifest doesn't contain required properties!";

  let code = pluginStore?.[url]?.code;
  if (pluginStore?.[url]?.manifest?.hash != manifest.hash)
    code = await (
      await fetch(parsedURL + (manifest.main ?? "index.js"), { cache: "no-store" })
    ).text();

  return [
    code,
    {
      name: manifest.name,
      author: manifest.author,
      description: manifest.description,
      hash: manifest.hash,
    },
  ];
}

export async function installPluginFromURL(url, enabled = true) {
  if (pluginStore[url])
    return actions.message.messageError({ message: "Plugin is already imported!" });

  try {
    const [code, manifest] = await fetchPluginFromURL(url);

    pluginStore[url] = {
      code,
      manifest,
      enabled,
      update: true,
    };

    if (enabled) runPlugin(url, code);
  } catch {
    actions.message.messageError({ message: "Failed to import neptune plugin!" });
  }
}

// The callback gets called once idb responds and the plugins are loaded into memory.
pluginStoreReady.then(async () => {
  // We don't attempt to load plugins if CSP exists because loading every plugin will fail and automatically disable the plugin.
  if (document.querySelector(`[http-equiv="Content-Security-Policy"]`)) return;

  for (const [id, plugin] of Object.entries(pluginStore)) {
    if (plugin.update) {
      try {
        const [code, manifest] = await fetchPluginFromURL(id);

        pluginId[manifest] = manifest;
        pluginId[id].code = code;
      } catch {
        console.log("[neptune] failed to update plugin");
      }
    }

    // We do not currently account for plugin updates, but this will be handled once
    // remote plugin installation is handled.
    if (plugin.enabled) runPlugin(id, plugin.code);
  }
});
