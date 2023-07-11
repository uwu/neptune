import * as voby from "voby"
import * as patcher from "spitroast";
import * as utils from "./api/utils";
import * as plugins from "./api/plugins";
import intercept from "./api/intercept";
import { observe } from "./api/observe";
import registerTab from "./api/registerTab";
import registerRoute from "./api/registerRoute";
import hookContextMenu from "./api/hookContextMenu";

export default {
  patcher,
  utils,
  intercept,
  observe,
  registerTab,
  registerRoute,
  hookContextMenu,
  voby,
  plugins
}