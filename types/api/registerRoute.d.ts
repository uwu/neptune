import type { intercept } from "./intercept";

export function registerRoute(
  path: string,
  component: CallableFunction,
): ReturnType<typeof intercept>;
