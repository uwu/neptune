import { ReactiveRoot } from "../ui/components";
import intercept from "./intercept";
import { observe } from "./observe";

const pageNotFoundSelector = `[class^="contentArea--"] [class^="pageNotFoundError--"]`;

const replacePage = (page, component) => {
  page.style.display = "none";

  const neptunePage = document.createElement("div");
  neptunePage.className = "__NEPTUNE_PAGE";

  page.insertAdjacentElement("afterend", neptunePage);
  neptunePage.appendChild(ReactiveRoot({ children: component }));
};

intercept("ROUTER_LOCATION_CHANGED", () => {
  for (const page of document.getElementsByClassName("__NEPTUNE_PAGE"))
    page.parentElement.removeChild(page);
});

export default function registerRoute(path, component) {
  return intercept("ROUTER_LOCATION_CHANGED", ([payload]) => {
    if (payload.pathname != `/neptune/${path}`) return;

    const pageNotFound = document.querySelector(pageNotFoundSelector);
    if (pageNotFound) return replacePage(pageNotFound, component);

    const unob = observe(pageNotFoundSelector, (page) => {
      unob.now();
      replacePage(page, component);
    });
  });
}
