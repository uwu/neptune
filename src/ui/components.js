import { html, render, $, isObservable } from "voby";

export function ReactiveRoot({ children }) {
  const root = html`<div style="display:contents" />`();
  root.addEventListener("DOMNodeRemovedFromDocument", render(html`${children}`, root));

  return root;
}

export function Switch(props) {
  let checked = props.checked ?? false;

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

export function TextInput({ placeholder = "", type = "text", value = "", onEnter = () => {} }) {
  if (!isObservable(value)) value = $(value);

  return html`
    <input
      class="neptune-text-input"
      value=${value}
      onKeyup=${(e) => {
        if (e.key != "Enter") return;
        onEnter(e);
      }}
      onInput=${(e) => value(e.target.value)}
      placeholder=${placeholder}
      type=${type} />
  `;
}

export function Button({ onClick = () => {}, children }) {
  return html` <button class="neptune-button" onClick=${onClick}>${children}</button> `;
}
