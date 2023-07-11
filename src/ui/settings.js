import { Switch } from "./components.js";
import registerRoute from "../api/registerRoute.js";
import { pluginStore, togglePlugin } from "../api/plugins.js";
import { $, html, For } from "voby";

let selectedTab = $(0);
const tabs = [
  {
    name: "Plugins",
    component: () => {
      return html`<${For} values=${() => Object.entries(pluginStore)}>
        ${([id, plugin]) => html`<${PluginCard} plugin=${plugin} id=${id} />`}
      </${For}>`;
    },
  },
  {
    name: "Themes",
    component: () => html`seriously those are some goddamn thick ones`,
  },
];

function PluginCard({ id, plugin }) {
  return html`<div class="neptune-plugin-card">
    <div class="neptune-plugin-card-content">
      <div>
        <div>
          <span class="neptune-plugin-title">${plugin.manifest.name}</span>
          <span> by </span>
          <span class="neptune-plugin-title">${plugin.manifest.author}</span>
        </div>
        <div style="font-size: medium">${plugin.manifest.description}</div>
      </div>
      <div style="margin-top: auto; margin-bottom: auto;">
        <${Switch}
          checked=${() => plugin.enabled}
          onClick=${() => {
            togglePlugin(id);
          }} />
      </div>
    </div>
  </div>`;
}

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
  html`<div style="padding: 0px 200px 0px 200px">
    <div style="display: flex; gap: 25px; padding-bottom: 10px">
      ${tabs.map(
        (tab, idx) =>
          html`<${TabButton} onClick=${() => selectedTab(idx)} className=${() =>
            idx == selectedTab() ? "neptune-active-tab" : ""}>${tab.name}</${TabButton}>`,
      )}
    </div>
    <div>${() => tabs[selectedTab()].component}</div>
  </div>`,
);
