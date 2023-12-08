import { $, For, html, useCleanup } from "voby";
import { TextInput, Switch, TrashIcon } from "./components";
import { themesStore, toggleTheme, removeTheme, importTheme } from "../api/themes";
import { actions } from "../handleExfiltrations.js";
import { appendStyle } from "../api/utils.js";

export function ThemesTab() {
  const themeToImport = $("");

  return html`
  <div style="margin-top: 10px; display: flex; gap: 10px; flex-direction: column">
    <${TextInput} onEnter=${() => {
      importTheme(themeToImport(), false).catch((e) => actions.message.messageError({ message: e }));
      themeToImport("");
    }} value=${themeToImport} placeholder="Import theme from URL" />
    <${For} values=${() => themesStore}>
      ${(theme) => html`<${ThemeCard} theme=${theme} />`}
    </${For}>
  </div>`;
}

function ThemeCard({ theme}) {
  // TODO: i have no fucking clue why this needs a try catch to not implode in on itself lmfao
  useCleanup(() => { try { removeStyle() } catch {} });

  let removeStyle = () => {};

  return html`<div class="neptune-card">
    <div class="neptune-card-content">
      <div style="padding-top: 10px; padding-bottom: 10px">
        <div>
          <span class="neptune-card-title">${theme.name}</span>
          <span> by </span>
          <span class="neptune-card-title">${theme.author}</span>
        </div>
        <div style="font-size: medium">${theme.description}</div>
      </div>
      <div style="margin-top: auto; margin-bottom: auto; display: flex">
        <button onClick=${() => removeTheme(theme.url)}>
          <${TrashIcon} />
        </button>
        <div onmouseover=${() => {
          try {
          removeStyle();
          } catch {}
          removeStyle = appendStyle(`@import url("${theme.url}");`)
        }}
        
        onmouseout=${() => removeStyle()}
        >
          <${Switch} checked=${() => theme.enabled} onClick=${() => toggleTheme(theme.url)} />
        </div>
      </div>
    </div>
  </div>`
}