import { ReactiveRoot } from "../ui/components.js";
import intercept from "./intercept.js";
import { observe } from "./observe.js";

const pageNotFoundSelector = `[class^="pageNotFoundError--"]`;

const replacePage = (page, component) => {
  page.style.display = "none";

  const neptunePage = document.createElement("div");
  neptunePage.className = "__NEPTUNE_PAGE";

  page.insertAdjacentElement("afterend", neptunePage);
  neptunePage.appendChild(ReactiveRoot({ children: component }));
};

intercept("router/NAVIGATED", () => {
  for (const page of document.getElementsByClassName("__NEPTUNE_PAGE"))
    page.parentElement.removeChild(page);
});

export default function registerRoute(path, component) {
  return intercept("router/NAVIGATED", ([payload]) => {
    if (payload.search != `?neptuneRoute=${path}`) return;

    const pageNotFound = document.querySelector(pageNotFoundSelector);
    if (pageNotFound) return replacePage(pageNotFound, component);

    const unob = observe(pageNotFoundSelector, (page) => {
      unob.now();
      replacePage(page, component);
    });
  });
}
