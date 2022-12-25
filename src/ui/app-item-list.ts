export class AppItemList extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    shadowRoot.innerHTML = `
      <style>
      :host {
        display: flex;
        flex-direction: column;

        user-select: none;
      }
      </style>

      <slot></slot>
    `;
  }

  connectedCallback() {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "list");
    }
  }
}
