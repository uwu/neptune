import * as arrow from "@arrow-js/core"
import * as patcher from "spitroast";
import * as utils from "./api/utils";
import intercept from "./api/intercept";
import { observe } from "./api/observe";
import registerTab from "./api/registerTab";
import hookContextMenu from "./api/hookContextMenu";

export default {
  patcher,
  utils,
  intercept,
  observe,
  registerTab,
  hookContextMenu,
  arrow
}