declare const neptune: {
  patcher: typeof import("spitroast");
  utils: typeof import("./api/utils");
  hookContextMenu: typeof import("./api/hookContextMenu").hookContextMenu;
  intercept: typeof import("./api/intercept").intercept;
  observe: typeof import("./api/observe").observe;
  registerRoute: typeof import("./api/registerRoute").registerRoute;
  registerTab: typeof import("./api/registerTab").registerTab;
  showModal: typeof import("./api/showModal").showModal;
  voby: typeof import("voby");
  plugins: typeof import("./api/plugins");
  components: typeof import("./ui/components");
  store: import("redux").Store<import("./tidal").CoreState>;
  actions: import("./tidal").NeptuneDispatchers;
  modules: Array<{
    id: string;
    loaded: boolean;
    exports: any;
  }>;
};
interface Window {
  neptune: typeof neptune;
}

declare module "@neptune/patcher" {
  export * from "spitroast";
}
declare module "@neptune/utils" {
  const mod: typeof import("./api/utils");
  export = mod;
}
declare module "@neptune/voby" {
  export * from "voby";
}
declare module "@neptune/plugins" {
  const mod: typeof import("./api/plugins");
  export = mod;
}
declare module "@neptune/components" {
  const mod: typeof import("./ui/components");
  export = mod;
}
declare module "@neptune" {
  export const patcher: typeof import("spitroast");
  export const utils: typeof import("./api/utils");
  export const hookContextMenu: typeof import("./api/hookContextMenu").hookContextMenu;
  export const intercept: typeof import("./api/intercept").intercept;
  export const observe: typeof import("./api/observe").observe;
  export const registerRoute: typeof import("./api/registerRoute").registerRoute;
  export const registerTab: typeof import("./api/registerTab").registerTab;
  export const showModal: typeof import("./api/showModal").showModal;
  export const voby: typeof import("voby");
  export const plugins: typeof import("./api/plugins");
  export const components: typeof import("./ui/components");
  export const store: import("redux").Store<import("./tidal").CoreState>;
  export const actions: import("./tidal").NeptuneDispatchers;
  export const modules: Array<{
    id: string;
    loaded: boolean;
    exports: any;
  }>;
}

type JSONObject = { [x: string]: JSONValue };
type JSONValue = string | number | boolean | JSONObject | Array<JSONValue>;

declare module "@plugin" {
  export const id: string;
  export const manifest: {
    name: string;
    author: string;
    description: string;
  };
  export const storage: JSONObject;
  export const addUnloadable: (callback: () => void) => void;
}

// declare module "@neptune/store" {
//   type Store = import("redux").Store<import("./tidal").CoreState>;
//   export default Store;
//   export * from "@neptune/store";
// }
// declare module "@neptune/actions" {
//   const actions: import("./tidal").NeptuneDispatchers;
//   export = actions;
// }
// declare module "@neptune/modules" {
//   const modules: Array<{ id: string; loaded: boolean; exports: any }>;
//   export default modules;
// }
