import {
  createStore as createIdbStore,
  set as idbSet,
  get as idbGet,
} from "idb-keyval";
import { store } from "voby";

export function appendStyle(style) {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = style;

  document.head.appendChild(styleTag);

  return (newStyle) => {
    if (newStyle == undefined) return document.head.removeChild(styleTag);

    styleTag.innerHTML = newStyle;
  };
}

const idbStore = createIdbStore(
  "__NEPTUNE_IDB_STORAGE",
  "__NEPTUNE_IDB_STORAGE"
);

export function createPersistentObject(id) {
  const persistentObject = store({});

  idbGet(id, idbStore).then((obj) =>
    store.reconcile(persistentObject, obj ?? {})
  );

  store.on(persistentObject, () => {
    idbSet(id, store.unwrap(persistentObject), idbStore);
  });

  return persistentObject;
}
