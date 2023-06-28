export const interceptors = {};

export default function intercept(types, cb, once = false) {
  if (typeof types == "string") types = [types];

  const uninterceptors = [];

  for (let type of types) {
    if (!interceptors[type]) interceptors[type] = [];

    // Being able to call a function defined in the future is why people hate JavaScript.
    const handleIntercept = once
      ? (...args) => {
          cb(...args);
          unintercept();
        }
      : cb;
    interceptors[type].push(handleIntercept);

    uninterceptors.push(() =>
      interceptors[type].splice(interceptors[type].indexOf(handleIntercept), 1)
    );
  }

  return () => uninterceptors.forEach(u => u());
}
