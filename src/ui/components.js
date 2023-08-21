import { html, render, $, isObservable } from "voby";

customElements.define(
  "neptune-reactive-root",
  class extends HTMLElement {
    constructor() {
      super();
      this.c = () => {};
    };

    connectedCallback() {
      this.style.display = "contents"
      this.dispose?.();
      this.dispose = render(html`${this.c()}`, this)
    };

    disconnectedCallback() {
      this.dispose?.()
    }
  },
);

export function ReactiveRoot({ children }) {
  const root = html`<neptune-reactive-root></neptune-reactive-root>`()
  root.c = () => children;

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
