import { Switch, TextInput } from "./components.js";
import registerRoute from "../api/registerRoute.js";
import { pluginStore, togglePlugin, removePlugin, installPluginFromURL } from "../api/plugins.js";
import { $, html, For } from "voby";

let selectedTab = $(0);
const tabs = [
  {
    name: "Plugins",
    component: () => {
      const pluginToImport = $("");

      return html`
      <div style="display: flex; gap: 10px; flex-direction: column">
        <div style="padding-top: 10px; display: flex; gap:10px">
          <!-- This text input *needs* to be able to have an onEnter event. -->
          <${TextInput} value=${pluginToImport} onEnter=${() => {
            pluginToImport("");
            installPluginFromURL(pluginToImport);
          }} placeholder="https://example.com" />
          <!-- This button will be used for importing from local files. -->
          <button class="neptune-round-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          </button>
        </div>
        <${For} values=${() => Object.entries(pluginStore)}>
          ${([id, plugin]) => html`<${PluginCard} plugin=${plugin} id=${id} />`}
        </${For}>
      </div>`;
    },
  },
  {
    name: "Themes",
    component: () => html`[WIP]`,
  },
];

function PluginCard({ id, plugin }) {
  return html`<div class="neptune-plugin-card">
    <div class="neptune-plugin-card-content">
      <div>
        <div style="display: flex; gap: 15px">
          <div style="display: grid; place-items: center">
            <!-- This is the delete button, we'll extract it to a component later. -->
            <button class="neptune-round-button" onClick=${() => removePlugin(id)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"></path>
              </svg>
            </button>
          </div>
          <div>
            <div>
              <span class="neptune-plugin-title">${plugin.manifest.name}</span>
              <span> by </span>
              <span class="neptune-plugin-title">${plugin.manifest.author}</span>
            </div>
            <div style="font-size: medium">${plugin.manifest.description}</div>
          </div>
        </div>
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
