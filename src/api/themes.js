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

  try {
    manifest = parseManifest(await (await fetch(url)).text());
  } catch {
    throw "Failed to parse theme manifest!";
  }

  if (!["name", "author", "description"].every((i) => typeof manifest[i] === "string"))
    throw "Manifest doesn't contain required properties!";

  const { name, author, description } = manifest;

  themesStore.unshift({
    name,
    author,
    description,
    enabled,
    url,
  });
}
