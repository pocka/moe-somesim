import type { AppTab } from "./tab";
import type { AppTabPanel } from "./tabpanel";
import { SelectEvent } from "./shared";

import css from "./tabs.css?raw";

export class AppTabs extends HTMLElement {
  static get observedAttributes() {
    return ["value"] as const;
  }

  attributeChangedCallback(
    name: typeof AppTabs.observedAttributes[number],
    oldValue: string | null,
    newValue: string | null
  ) {
    if (oldValue === newValue) {
      return;
    }

    switch (name) {
      case "value": {
        this.#value = newValue;
        this.#configureChildren();
        return;
      }
    }
  }

  #value: string | null = null;
  #tablist = document.createElement("div");

  get value() {
    return this.#value;
  }

  set value(v: string | null) {
    this.#value = v;
    this.#configureChildren();
  }

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = css;

    shadow.appendChild(style);

    const tabSlot = document.createElement("slot");
    tabSlot.name = "tab";

    this.#tablist.appendChild(tabSlot);

    this.#tablist.classList.add("tablist");
    shadow.appendChild(this.#tablist);

    const defaultSlot = document.createElement("slot");

    const panel = document.createElement("div");
    panel.classList.add("panel");

    panel.appendChild(defaultSlot);

    shadow.appendChild(panel);

    this.addEventListener(SelectEvent, (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      if (!(ev instanceof CustomEvent)) {
        return;
      }

      const { value } = ev.detail;
      if (typeof value !== "string") {
        return;
      }

      this.#value = value;
      this.#configureChildren();

      this.dispatchEvent(
        new CustomEvent("app-tab-change", {
          detail: { value },
        })
      );
    });
  }

  connectedCallback() {
    this.#tablist.setAttribute("role", "tablist");

    const value = this.getAttribute("value");
    if (value) {
      this.#value = value;
    }

    this.#configureChildren();
  }

  #configureChildren() {
    const tabs = this.querySelectorAll<AppTab>("app-tab");

    if (!tabs[0]) {
      return;
    }

    if (!this.#value) {
      this.#value = tabs[0].value;
    }

    for (const tab of Array.from(tabs)) {
      if (tab.value === this.#value) {
        tab.tabIndex = 0;
        tab.setAttribute("aria-selected", "true");
      } else {
        tab.tabIndex = -1;
        tab.setAttribute("aria-selected", "false");
      }
    }

    const panels = this.querySelectorAll<AppTabPanel>("app-tab-panel");

    for (const panel of Array.from(panels)) {
      if (panel.value === this.#value) {
        panel.dataset.state = "visible";
      } else {
        panel.dataset.state = "hidden";
      }
    }
  }
}
