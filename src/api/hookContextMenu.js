import intercept from "./intercept";
import { observe } from "./observe";

export default function hookContextMenu(menuType, name, handler) {
  return intercept("contextMenu/OPEN", ([payload]) => {
    // TODO: Change this to a switch statement.
    if (!payload?.type == menuType) return;

    const unob = observe(`[data-type="contextmenu-item"]`, (elem) => {
      unob.now();

      const contextMenuItem = elem.cloneNode(true);
      const contextMenuLabel = contextMenuItem.querySelector(
        `[class^="actionTextInner--"]`
      );
      contextMenuLabel.innerText = name;

      const parentClasses = contextMenuLabel.parentElement.classList;

      contextMenuItem.innerHTML = "";

      const contextMenuWrapper = document.createElement("div");
      contextMenuWrapper.setAttribute("tabindex", "0")
      contextMenuWrapper.classList.add(...parentClasses);
      contextMenuWrapper.appendChild(contextMenuLabel);

      contextMenuItem.addEventListener("keyup", (event) => {
        if (event.keyCode != 13) return;

        event.target.click();
      })

      contextMenuItem.appendChild(contextMenuWrapper);

      contextMenuItem.addEventListener("click", (event) => {
        handler(event);
      });

      elem.parentElement.appendChild(contextMenuItem);
    });
  });
}
