import { store } from "voby";
import { appendStyle, createPersistentObject, parseManifest } from "./utils.js";

export const [themesStore, themesStoreReady] = createPersistentObject("NEPTUNE_THEMES", true);

let updateThemeStyle = appendStyle("");

// Not sure why this didn't work previously?
store.on(themesStore, reloadThemes)

function reloadThemes() {
  updateThemeStyle(themesStore.filter(t => t.enabled).map((t) => `@import url("${t.url}")`).join(";"));
}

export function removeTheme(url) {
  themesStore.splice(
    themesStore.findIndex((t) => t.url == url),
    1,
  );
}

export function toggleTheme(url) {
  const theme = themesStore.find((t) => t.url == url);
  theme.enabled = !theme.enabled;
}

export async function importTheme(url, enabled = true) {
  let manifest;
  let text;

  try {
	text = await (await fetch(url)).text();
  } catch {
	throw "Failed to fetch theme!";
  }

  try {
    manifest = parseManifest(text);
  } catch (e) {
    manifest = {
		name: url.split("/").pop(),
		author: "Unknown",
		description: "No description provided.",
	}
  }

  themesStore.unshift({
    name: manifest.name,
    author: manifest.author,
    description: manifest.description,
    enabled,
    url,
  });
}
