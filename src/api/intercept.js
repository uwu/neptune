export const interceptors = {};

export default function intercept(types, cb, once = false) {
  if (typeof types == "string") types = [types];

  const uninterceptors = [];
  const unintercept = () => uninterceptors.forEach((u) => u());

  for (let type of types) {
    if (!interceptors[type]) interceptors[type] = [];

    const handleIntercept = once
      ? (...args) => {
          unintercept();

          return cb(...args);
        }
      : cb;
    interceptors[type].push(handleIntercept);

    uninterceptors.push(() =>
      interceptors[type].splice(interceptors[type].indexOf(handleIntercept), 1),
    );
  }

  return unintercept;
}
