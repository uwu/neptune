export function registerTab(
  name: HTMLElement["textContent"],
  path: string,
  component?: CallableFunction,
): () => void;
