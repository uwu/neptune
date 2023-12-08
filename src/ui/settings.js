import { $, html } from "voby";
import { PluginTab } from "./pluginsTab.js";
import { ThemesTab } from "./themesTab.js";
import registerRoute from "../api/registerRoute.js";
import hookContextMenu from "../api/hookContextMenu.js";

let selectedTab = $(0);
const tabs = [
  {
    name: "Plugins",
    component: PluginTab,
  },
  {
    name: "Themes",
    component: ThemesTab,
  },
  {
    name: "Addon Store",
    component: () => html`[WIP]`,
  },
];

function TabButton({ className = "", onClick = () => {}, children }) {
  return html`<button
    onClick=${onClick}
    style="font-weight: 500; font-size: 1.14286rem; padding-bottom: 6px"
    class="${className}">
    ${children}
  </button>`;
}

registerRoute(
  "settings",
  html`<div style="width: 675px">
    <div>
      <div style="display: flex; gap: 25px; padding-bottom: 10px">
        ${tabs.map(
          (tab, idx) =>
            html`<${TabButton} onClick=${() => selectedTab(idx)} className=${() =>
              idx == selectedTab() ? "neptune-active-tab" : ""}>${tab.name}</${TabButton}>`,
        )}
      </div>
      <div>${() => tabs[selectedTab()].component}</div>
    </div>
  </div>`,
);

hookContextMenu("USER_PROFILE", "neptune settings", () =>
  neptune.actions.router.push({ pathname: "/neptune/settings", replace: true }),
);
