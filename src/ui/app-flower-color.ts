export class AppFlowerColor extends HTMLElement {
  static get observedAttributes(): readonly string[] {
    return ["flower-name", "color"];
  }

  attributeChangedCallback(
    name: "flower-name" | "color",
    _oldValue: string | undefined,
    newValue: string | undefined
  ) {
    switch (name) {
      case "flower-name": {
        this.#applyLabelToButton(newValue || "");
        return;
      }
      case "color": {
        this.#button.style.backgroundColor = newValue || "transparent";
        return;
      }
    }
  }

  #button = document.createElement("button");

  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");

    style.textContent = `
      .button {
        appearance: none;
        display: block;
        width: 100%;
        height: 100%;
        border: 1px solid hsl(0 0% 50%);
        padding: 0;
        margin: 0;
        aspect-ratio: 1 / 1;

        background-color: transparent;
        border-radius: 2px;
        cursor: pointer;
        color: inherit;
        outline: none;
        overflow: hidden;
      }
      .button:hover {
      }
    `;

    shadowRoot.appendChild(style);

    this.#button.classList.add("button");

    shadowRoot.appendChild(this.#button);
  }

  connectedCallback() {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "listitem");
    }

    const name = this.getAttribute("flower-name");
    this.#applyLabelToButton(name || "");

    const color = this.getAttribute("color");
    if (color) {
      this.#button.style.backgroundColor = color;
    }
  }

  #applyLabelToButton(label: string): void {
    this.#button.title = label;
    this.#button.setAttribute("aria-label", label);
  }
}
