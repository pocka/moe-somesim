export class AppFlowerGroup extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    shadowRoot.innerHTML = `
      <style>
      .title {
        font: var(--app-font-body);
        margin-bottom: 0.8rem;

        color: hsl(var(--app-color-foreground-dimmed));
        -webkit-user-select: none;
        user-select: none;
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
