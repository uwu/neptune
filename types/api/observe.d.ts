interface Unobserver {
  (): void;
  now(): void;
}
export function observe(selector: string, cb: (el: HTMLElement | SVGElement) => any): Unobserver;
