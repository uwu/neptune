import { ReactiveRoot } from "../ui/components.js";
import { actions } from "../handleExfiltrations.js";
import { observe } from "./observe.js";

export default function showModal(name, component) {
  actions.modal.showReleaseNotes();
  const unob = observe(`[class^="modalHeader--"]`, (header) => {
    unob.now();

    header.getElementsByTagName("h4")[0].innerText = name;

    header.nextSibling.replaceChildren(
      ReactiveRoot({
        children: component,
      }),
    );
  });
}
