import * as voby from "voby";
import * as patcher from "spitroast";
import * as utils from "./api/utils.js";
import * as plugins from "./api/plugins.js";
import * as themes from "./api/themes.js";
import * as components from "./ui/components.js";
import intercept from "./api/intercept.js";
import { observe } from "./api/observe.js";
import registerTab from "./api/registerTab.js";
import registerRoute from "./api/registerRoute.js";
import hookContextMenu from "./api/hookContextMenu.js";
import showModal from "./api/showModal.js";
// TODO: AWFUL VOMIT VOMIT KILL MURDER DIE KILL KILL DIE MURDER VOMIT
import { store } from "./handleExfiltrations.js";

let currentMediaItem = {};

try {
  const vibrantColorStyle = utils.appendStyle("");

  intercept("playbackControls/MEDIA_PRODUCT_TRANSITION", ([{ mediaProduct }]) => {
    Object.assign(
      currentMediaItem,
      store.getState().content.mediaItems[mediaProduct.productId],
    );
    const vibrantColor = currentMediaItem?.item?.album?.vibrantColor;

    if (!vibrantColor) return;

    vibrantColorStyle(`:root{--track-vibrant-color:${vibrantColor}}`);
  });
} catch {}

export default {
  patcher,
  utils,
  intercept,
  observe,
  registerTab,
  registerRoute,
  hookContextMenu,
  showModal,
  voby,
  plugins,
  themes,
  components,
  currentMediaItem,
};
