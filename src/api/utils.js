import { createStore as createIdbStore, set as idbSet, get as idbGet } from "idb-keyval";
import { store } from "voby";

export function appendStyle(style) {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = style;

  // Forgive me, for I have sinned.
  if (document.head) {
    document.head.appendChild(styleTag);
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      document.head.appendChild(styleTag);
    });
  }

  return (newStyle) => {
    if (newStyle == undefined) return document.head.removeChild(styleTag);

    styleTag.innerHTML = newStyle;
  };
}

export const neptuneIdbStore = createIdbStore("__NEPTUNE_IDB_STORAGE", "__NEPTUNE_IDB_STORAGE");

// store.on appears to not work upon isArray being true. This makes me a very sad toonlink.
export function createPersistentObject(id, isArray = false) {
  // This is fucking moronic. But fine, we'll do this dumb shit just for you.
  const persistentObject = store(isArray ? { value: [] } : {});

  store.on(persistentObject, () => {
    idbSet(id, store.unwrap(persistentObject), neptuneIdbStore);
  });

  return [
    isArray ? persistentObject.value : persistentObject,
    new Promise((res) =>
      idbGet(id, neptuneIdbStore).then((obj) => {
        store.reconcile(persistentObject, obj ?? (isArray ? { value: [] } : {}));
        res();
      }),
    ),
  ];
}

export const parseManifest = (manifest) => {
  try {
    if (typeof manifest == "string")
      manifest = JSON.parse(manifest.slice(manifest.indexOf("/*") + 2, manifest.indexOf("*/")));
  } catch {
    throw "Failed to parse manifest!";
  }

  if (!["name", "author", "description"].every((i) => typeof manifest[i] === "string"))
    throw "Manifest doesn't contain required properties!";

  return manifest;
};

export const getMediaURLFromID = (id, path = "/1280x1280.jpg") =>
  "https://resources.tidal.com/images/" + id.split("-").join("/") + path;

export function convertHexToRGB(h) {
  let r = 0;
  let g = 0;
  let b = 0;

  // 3 digits
  if (h.length === 4) {
    r = Number("0x" + h[1] + h[1]);
    g = Number("0x" + h[2] + h[2]);
    b = Number("0x" + h[3] + h[3]);

    // 6 digits
  } else if (h.length === 7) {
    r = Number("0x" + h[1] + h[2]);
    g = Number("0x" + h[3] + h[4]);
    b = Number("0x" + h[5] + h[6]);
  }

  return `${r}, ${g}, ${b}`;
}

// this impl can be changed when things (probably) break again, lol
export function pushVirtualRoute(route) {
  neptune.actions.router.push({
    pathname: `/not-found`,
    search: `?neptuneRoute=${route}`,
    replace: true,
  });
}
