export class AppFlowerGroup extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    shadowRoot.innerHTML = `
      <style>
      .title {
        font-size: 1.4rem;
        font-weight: bold;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, 2.4rem);
        grid-template-rows: repeat(auto-fit, 2.4rem);
        gap: 0.4rem;
      }
      </style>

      <div class="title"><slot name="title"></slot></div>

      <div class="grid">
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "list");
    }
  }
}
