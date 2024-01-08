import { generatePanelId, generateTabId } from "./shared";

import css from "./tabpanel.css?raw";

export class AppTabPanel extends HTMLElement {
  static get observedAttributes() {
    return ["value"] as const;
  }

  attributeChangedCallback(
    name: (typeof AppTabPanel.observedAttributes)[number],
    oldValue: string | null,
    newValue: string | null
  ) {
    if (oldValue === newValue) {
      return;
    }

    switch (name) {
      case "value": {
        this.#value = newValue;
        this.#syncAttrs(newValue);
        return;
      }
    }
  }

  #value: string | null = null;

  get value() {
    return this.#value;
  }

  set value(v: string | null) {
    this.#value = v;
    this.#syncAttrs(v);
  }

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = css;

    shadow.appendChild(style);

    const slot = document.createElement("slot");
    shadow.appendChild(slot);
  }

  connectedCallback() {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "tab");
    }

    this.tabIndex = 0;

    this.#syncAttrs();
  }

  #syncAttrs(value: string | null = this.getAttribute("value")) {
    if (!value) {
      return;
    }

    this.id = generatePanelId(value);
    this.setAttribute("aria-labelledby", generateTabId(value));
  }
}
