import registerRoute from "./registerRoute.js";
import intercept from "./intercept.js";

function makeInactive(tab) {
  tab.classList.remove(Array.from(tab.classList).find((c) => c.startsWith("activeItem--")));
}

const getTabs = () => document.querySelector(`.sidebarWrapper section[class^="section--"]`);

// Automatically set tab to unchecked.
intercept("ROUTER_LOCATION_CHANGED", () => {
  for (const tab of document.getElementsByClassName("__NEPTUNE_TAB")) tab.style.color = "";
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

    const removeRouteHandler = registerRoute(path, () => {
      tab.style.color = "var(--wave-color-solid-accent-fill)";

      return component;
    });

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
        true,
      ),
    );
  } else addTab(tabs);

  return () => unobservers.forEach((u) => u());
}
