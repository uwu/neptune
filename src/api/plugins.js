import { store } from "voby";
import { createPersistentObject, neptuneIdbStore, parseManifest } from "./utils.js";
import { del } from "idb-keyval";
import quartz from "@uwu/quartz";
import urlImport from "quartz-plugin-url-import";
import { actions } from "../handleExfiltrations.js";
import intercept from "./intercept.js";

export const [pluginStore, pluginStoreReady] = createPersistentObject("NEW_NEPTUNE_PLUGINS", true);
export const enabled = store({});

export const getPluginById = (id) => pluginStore.find((p) => p.id == id);

export async function disablePlugin(id) {
  getPluginById(id).enabled = false;
  const onUnload = enabled?.[id]?.onUnload;

  delete enabled[id];

  try {
    await onUnload?.();
  } catch (e) {
    console.error("Failed to completely clean up neptune plugin!\n", e);
  }
}

export function togglePlugin(id) {
  return getPluginById(id).enabled ? disablePlugin(id) : enablePlugin(id);
}

export async function enablePlugin(id) {
  const plugin = getPluginById(id);
  plugin.enabled = true;

  await runPlugin(plugin);
}

async function runPlugin(plugin) {
  try {
    const [persistentStorage, persistentStorageReady] = createPersistentObject(
      plugin.id + "_PERSISTENT_STORAGE",
    );

    await persistentStorageReady;

    const unloadables = [];
    const pluginData = {
      id: plugin.id,
      manifest: plugin.manifest,
      storage: persistentStorage,
      addUnloadable(callback) {
        unloadables.push(callback);
      },
    };

    const { onUnload, Settings } = await quartz(plugin.code, {
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

    enabled[plugin.id] = {
      onUnload: () => {
        onUnload?.();
        for (const ul of unloadables) {
          ul();
        }
      },
    };
    if (Settings) enabled[plugin.id].Settings = Settings;
  } catch (e) {
    await disablePlugin(plugin.id);

    console.error("Failed to load neptune plugin!\n", e);
  }
}

export async function installPlugin(id, code, manifest, enabled = true) {
  const plugin = {
    id,
    code,
    manifest,
    enabled,
  };

  pluginStore.unshift(plugin);

  if (enabled) await runPlugin(plugin);
}

export async function removePlugin(id) {
  try {
    if (enabled[id]) await enabled[id].onUnload();
  } catch {
    console.log("[neptune] failed to unload plugin upon removal");
  }

  pluginStore.splice(
    pluginStore.findIndex((p) => p.id == id),
    1,
  );

  await del(id + "_PERSISTENT_STORAGE", neptuneIdbStore);
}

// This handles caching too!
export async function fetchPluginFromURL(url) {
  let parsedURL = url;

  if (!parsedURL.endsWith("/")) parsedURL += "/";

  const manifest = parseManifest(
    await (await fetch(parsedURL + "manifest.json", { cache: "no-store" })).json(),
  );

  const plugin = getPluginById(url);
  let code = plugin?.code;

  if (plugin?.manifest?.hash != manifest.hash)
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

export async function reloadPlugin(plugin) {
  let pluginWasEnabled = plugin.enabled;

  if (pluginWasEnabled) disablePlugin(plugin.id);

  if (plugin.hasOwnProperty("update")) {
    try {
      const [code, manifest] = await fetchPluginFromURL(plugin.id);

      plugin.manifest = manifest;
      plugin.code = code;
    } catch {}
  }

  if (pluginWasEnabled) enablePlugin(plugin.id);
}

export async function installPluginFromURL(url, enabled = true) {
  if (getPluginById(url))
    return actions.message.messageError({ message: "Plugin is already imported!" });

  try {
    const [code, manifest] = await fetchPluginFromURL(url);

    const plugin = {
      id: url,
      code,
      manifest,
      enabled,
      update: true,
    };

    pluginStore.unshift(plugin);

    if (enabled) runPlugin(plugin);
  } catch {
    actions.message.messageError({ message: "Failed to import neptune plugin!" });
  }
}

// Load as early as we possibly can.
intercept(
  "session/RECEIVED_COUNTRY_CODE",
  async () => {
    // We don't attempt to load plugins if CSP exists because loading every plugin will fail and automatically disable the plugin.
    if (document.querySelector(`[http-equiv="Content-Security-Policy"]`) || window.require) return;

    for (const plugin of pluginStore) {
      if (plugin.update) {
        try {
          const [code, manifest] = await fetchPluginFromURL(plugin.id);

          plugin.manifest = manifest;
          plugin.code = code;
        } catch {
          console.log("[neptune] failed to update plugin");
        }
      }

      // We do not currently account for plugin updates, but this will be handled once
      // remote plugin installation is handled.
      if (plugin.enabled) runPlugin(plugin);
    }
  },
  true,
);
