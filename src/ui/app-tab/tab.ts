import { generatePanelId, generateTabId, SelectEvent } from "./shared";

import css from "./tab.css?raw";

export class AppTab extends HTMLElement {
  static get observedAttributes() {
    return ["value"] as const;
  }

  attributeChangedCallback(
    name: typeof AppTab.observedAttributes[number],
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

    this.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      this.dispatchEvent(
        new CustomEvent(SelectEvent, {
          detail: {
            value: this.#value,
          },
          bubbles: true,
          cancelable: true,
        })
      );
    });

    this.addEventListener("keydown", (ev) => {
      switch (ev.key) {
        case "ArrowRight": {
          if (!this.parentElement) {
            return;
          }

          ev.preventDefault();
          ev.stopPropagation();

          const next = this.parentElement.querySelector<AppTab>(
            `#${this.id} ~ app-tab`
          );
          if (!next) {
            const first = this.parentElement.querySelector<AppTab>(
              "app-tab:first-of-type"
            );
            if (!first) {
              return;
            }

            first.focus();
            first.click();
            return;
          }

          next.focus();
          next.click();
          return;
        }
        case "ArrowLeft": {
          if (!this.parentElement) {
            return;
          }

          ev.preventDefault();
          ev.stopPropagation();

          const tabs = Array.from(
            this.parentElement.querySelectorAll<AppTab>("app-tab")
          );
          const index = tabs.indexOf(this);

          if (index < 0) {
            tabs[0]?.focus();
            tabs[0]?.click();
            return;
          }

          if (index === 0) {
            tabs[tabs.length - 1]?.focus();
            tabs[tabs.length - 1]?.click();
            return;
          }

          tabs[index - 1]?.focus();
          tabs[index - 1]?.click();
          return;
        }
      }
    });
  }

  connectedCallback() {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "tab");
    }

    this.#syncAttrs();
  }

  #syncAttrs(value: string | null = this.getAttribute("value")) {
    if (!value) {
      return;
    }

    this.id = generateTabId(value);
    this.setAttribute("aria-controls", generatePanelId(value));
  }
}
