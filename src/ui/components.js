import { html, render, $ } from "voby";

export function ReactiveRoot({ children }) {
  const root = html`<div style="display:contents" />`();
  root.addEventListener("DOMNodeRemovedFromDocument", render(html`${children}`, root));

  return root;
}

export function Switch(props) {
  const checked = props.checked ?? false;

  if (!props.onClick) {
    checked = $(!!checked);
    props.onClick = () => checked((c) => !c);
  }

  return html`
    <div>
      <input class="neptune-switch-checkbox" type="checkbox" checked=${checked} />
      <span onClick=${props.onClick} class="neptune-switch"></span>
    </div>
  `;
}
