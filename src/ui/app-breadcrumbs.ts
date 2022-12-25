export class AppBreadcrumbs extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    shadowRoot.innerHTML = `
      <style>
        ::slotted(*) {
          display: inline;
          padding: 0;
          margin: 0;
        }

        ::slotted(:not(:last-child))::after {
          content: ">";
          margin: 0 0.5em;

          opacity: 0.3;
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
