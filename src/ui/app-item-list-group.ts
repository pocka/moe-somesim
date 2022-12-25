export class AppItemListGroup extends HTMLElement {
  #depth: number = 0;

  get depth() {
    return this.#depth;
  }

  set depth(n: number) {
    this.#depth = n;

    this.style.setProperty("--_depth", n.toString(10));
  }

  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    shadowRoot.innerHTML = `
      <style>
      :host {
        --_depth: 0;

        display: block;
        margin: 2px 0;
      }

      .title {
        position: sticky;
        top: calc(var(--_depth, 0) * (2rem + 4px) + 4px);
        display: block;
        border: 1px solid hsl(0 0% 20%);
        font-size: 1.4rem;
        padding: 2px 4px;
        height: 2rem;

        background-color: hsl(0 0% 15%);
        border-radius: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        z-index: calc(100 - var(--_depth));
      }

      ::slotted(ul) {
        display: block;
        padding: 0;
        padding-left: 1em;
        margin: 0;

        list-style: none;
      }
      </style>

      <span class="title"><slot name="title"></slot></span>

      <slot></slot>
    `;
  }

  connectedCallback() {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "listitem");
    }

    const parent = this.parentElement;
    if (parent) {
      const ancestor = parent.closest<AppItemListGroup>("app-item-list-group");
      if (ancestor) {
        this.depth = ancestor.depth + 1;
      }
    }
  }
}
