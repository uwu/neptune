import { html, render, $, isObservable } from "voby";

customElements.define(
  "neptune-reactive-root",
  class extends HTMLElement {
    constructor() {
      super();
      this.c = () => {};
    }

    connectedCallback() {
      this.style.display = "contents";
      this.dispose?.();
      this.dispose = render(html`${this.c()}`, this);
    }

    disconnectedCallback() {
      this.dispose?.();
    }
  },
);

export function ReactiveRoot({ children }) {
  const root = html`<neptune-reactive-root></neptune-reactive-root>`();
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

export function ReloadIcon() {
  return html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>`;
}

export function TrashIcon() {
  return html`<svg
    style="width: 22px;"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"></path>
  </svg>`;
}
