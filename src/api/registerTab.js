import intercept from "./intercept";
import { observe } from "./observe";

function makeInactive(tab) {
  tab.classList.remove(
    Array.from(tab.classList).find((c) => c.startsWith("activeItem--"))
  );
}

const getTabs = () =>
  document.querySelector(`.sidebarWrapper section[class^="section--"]`);

const pageNotFoundSelector = `[class^="contentArea--"] [class^="pageNotFoundError--"]`;

// Automatically unhide hidden elements and clear out our pages.
intercept("ROUTER_LOCATION_CHANGED", () => {
  try {
    document
      .querySelectorAll(pageNotFoundSelector)
      .style.display = "block";
  } catch {}

  const neptunePage = document.querySelector(".__NEPTUNE_PAGE");
  if (neptunePage) neptunePage.parentElement.removeChild(neptunePage);
});

/*
  This entire function abuses their router's 404 handling to insert our own tabs.
  Because 404s count towards router history, our tabs function perfectly fine even when using the back arrows!
*/
export default function registerTab(name, path, component = () => {}) {
  const unobservers = [];

  const addTab = (tabs) => {
    const tab = tabs.children[0].cloneNode(true);
    makeInactive(tab);

    tab.querySelector(`[class^="responsiveText--"]`).textContent = name;

    tab.classList.add("__NEPTUNE_TAB");

    tab.addEventListener("click", (e) => {
      e.preventDefault();

      neptune.actions.router.push({
        pathname: `/neptune/${path}`,
        replace: true,
      });
    });

    const removeRouteHandler = neptune.intercept(
      "ROUTER_LOCATION_CHANGED",
      ([payload]) => {
        if (payload.pathname == `/neptune/${path}`) {
          tab.style.color = "var(--wave-color-solid-accent-fill)";

          const showTab = (page) => {
            page.style.display = "none";

            const neptunePage = document.createElement("div");
            neptunePage.className = "__NEPTUNE_PAGE";

            page.insertAdjacentElement("afterend", neptunePage);
            component(neptunePage);
          };

          const pageNotFound = document.querySelector(pageNotFoundSelector);
          if (pageNotFound) return showTab(pageNotFound);

          const unob = observe(pageNotFoundSelector, (page) => {
            unob.now();
            showTab(page);
          });
        } else {
          tab.style.color = "";
        }
      }
    );

    tabs.appendChild(tab);
    unobservers.push(removeRouteHandler, () => tabs.removeChild(tab));
  };

  const tabs = getTabs();

  if (!tabs) {
    // Instead of DOM observing we just intercept the first action that gets called after the UI shows. Maybe we can DOM observe later?
    unobservers.push(
      intercept(
        "favorites/SET_FAVORITE_IDS",
        () => {
          addTab(getTabs());
        },
        true
      )
    );
  } else addTab(tabs);

  return () => unobservers.forEach((u) => u());
}
