import { createPersistentObject } from "./utils";
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
  pluginStore[id].enabled ? disablePlugin(id) : enablePlugin(id);
}

export async function enablePlugin(id) {
  pluginStore[id].enabled = true;
  await runPlugin(id, pluginStore[id].code);
}

async function runPlugin(id, pluginCode) {
  try {
    // TODO: fix this quartz bug. no fucking clue what causes this shit.
    const { onUnload } = await quartz(" " + pluginCode, quartzConfig);

    enabled[id] = { onUnload: onUnload ?? (() => {}) };
  } catch (e) {
    await disablePlugin(id);

    console.error("Failed to load neptune plugin!\n", e);
  }
}

export async function installPlugin(id, pluginCode, manifest, enabled = true) {
  pluginStore[id] = {
    pluginCode,
    manifest,
    enabled,
  };

  if (enabled) await runPlugin(id, pluginCode);
}

export function removePlugin(id) {
  delete pluginStore[id];
}
