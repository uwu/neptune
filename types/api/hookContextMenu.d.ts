import type { intercept } from "./intercept";

export function hookContextMenu(
  menuType: string,
  name: string,
  handler: (e: MouseEvent) => any,
): ReturnType<typeof intercept>;
