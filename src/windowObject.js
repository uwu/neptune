import * as voby from "voby";
import * as patcher from "spitroast";
import * as utils from "./api/utils.js";
import * as plugins from "./api/plugins.js";
import intercept from "./api/intercept.js";
import { observe } from "./api/observe.js";
import registerTab from "./api/registerTab.js";
import registerRoute from "./api/registerRoute.js";
import hookContextMenu from "./api/hookContextMenu.js";

export default {
  patcher,
  utils,
  intercept,
  observe,
  registerTab,
  registerRoute,
  hookContextMenu,
  voby,
  plugins,
};
