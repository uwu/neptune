import type { store } from "voby";
import type { createPersistentObject } from "./utils";

export const [pluginStore, pluginStoreReady]: ReturnType<typeof createPersistentObject<Plugin>>;

export const enabled: ReturnType<typeof store>;

export interface PluginManifest {
  name: string;
  author: string;
  description: string;
  hash: string;
}

export interface Plugin {
  id: string;
  code: string;
  manifest: PluginManifest;
  enabled: boolean;
  update: boolean;
}

export function getPluginById(id: Plugin["id"]): Plugin | undefined;
export function disablePlugin(id: Plugin["id"]): Promise<void>;
export function togglePlugin(
  id: Plugin["id"],
): ReturnType<typeof disablePlugin> | ReturnType<typeof enablePlugin>;
export function enablePlugin(id: Plugin["id"]): Promise<void>;
export function installPlugin(
  id: Plugin["id"],
  code: Plugin["code"],
  manifest: PluginManifest,
  enabled?: boolean,
): Promise<void>;
export function removePlugin(id: Plugin["id"]): Promise<void>;
export function fetchPluginFromURL(url: string): Promise<[code: string, manifest: PluginManifest]>;
export function reloadPlugin(plugin: Plugin): Promise<void>;
export function installPluginFromURL(
  url: Parameters<typeof fetchPluginFromURL>[0],
  enabled?: boolean,
): Promise<void>;
