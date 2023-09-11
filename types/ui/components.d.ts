import type { createElement } from "voby";

// Voby doesn't export the Element type ????????????????????????????????????????
export type Element = ReturnType<typeof createElement>;

export interface ReactiveRootPropTypes {
  children: Element;
}
export function ReactiveRoot({ children }: ReactiveRootPropTypes): Element;

export interface SwitchPropTypes {
  checked?: HTMLInputElement["checked"];
  onClick: HTMLSpanElement["onclick"];
}
export function Switch(props: SwitchPropTypes): Element;

export interface TextInputPropTypes {
  placeholder: HTMLInputElement["placeholder"];
  type: HTMLInputElement["type"];
  value: HTMLInputElement["value"];
  onEnter: (ev: Parameters<HTMLInputElement["onkeyup"]>[0]) => any;
}
export function TextInput({
  placeholder = "",
  type = "text",
  value = "",
  onEnter = () => {},
}: TextInputPropTypes): Element;

export interface ButtonPropTypes {
  onClick: HTMLButtonElement["onclick"];
  children: Element;
}
export function Button({ onClick = () => {}, children }: ButtonPropTypes): Element;
