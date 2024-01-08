export class AppTree extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    shadowRoot.innerHTML = `<slot></slot>`;

    this.addEventListener("keydown", (ev) => {
      switch (ev.key) {
        case "Home": {
          ev.stopPropagation();
          ev.preventDefault();

          this.#focusFirstItem();

          return;
        }
        case "End": {
          ev.stopPropagation();
          ev.preventDefault();

          const last = this.querySelector(
            ":scope > app-tree-group:last-child, :scope > app-tree-item:last-child"
          );
          if (isValidTreeItem(last)) {
            last.focusLastItem();
            return;
          }

          return;
        }
      }
    });

    this.addEventListener("focus", (ev) => {
      if (ev.currentTarget !== this) {
        return;
      }

      const previouslyFocusedItem = this.querySelector("[tabindex='0']");
      if (isValidTreeItem(previouslyFocusedItem)) {
        previouslyFocusedItem.focus();
      } else {
        this.#focusFirstItem();
      }

      ev.preventDefault();
      ev.stopPropagation();
    });

    this.addEventListener("focusin", () => {
      this.tabIndex = -1;
    });

    this.addEventListener("focusout", (ev) => {
      if (ev.relatedTarget && this.contains(ev.relatedTarget as Node)) {
        return;
      }

      this.tabIndex = 0;
    });
  }

  connectedCallback() {
    const label = this.getAttribute("label");
    if (!this.hasAttribute("aria-label") && label) {
      this.setAttribute("aria-label", label);
    }

    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "tree");
    }

    this.tabIndex = 0;
  }

  #focusFirstItem() {
    const first = this.querySelector(
      ":scope > app-tree-group:first-of-type, :scope > app-tree-item:first-of-type"
    );

    if (!isValidTreeItem(first)) {
      return;
    }

    first.focus();
  }
}

function isValidTreeItem(el: Element | null): el is AppTreeGroup | AppTreeItem {
  return !!el && /^app-tree-/i.test(el.tagName) && el instanceof HTMLElement;
}

class AppTreeNode extends HTMLElement {
  constructor() {
    super();

    this.addEventListener("blur", (ev) => {
      const root = this.closest("app-tree") as AppTree;
      if (!root) {
        return;
      }

      if (!ev.relatedTarget || !root.contains(ev.relatedTarget as Node)) {
        return;
      }

      this.tabIndex = -1;
    });
  }

  connectedCallback() {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "treeitem");
    }

    this.tabIndex = -1;
  }

  public focus() {
    super.focus();

    this.tabIndex = 0;
  }

  public focusNextItem() {
    const next = this.nextElementSibling;
    if (isValidTreeItem(next)) {
      next.focus();
      return;
    }

    const parent = this.parentElement;
    if (!isValidTreeItem(parent)) {
      return;
    }

    parent.focusNextItem();
  }
}

export class AppTreeGroup extends AppTreeNode {
  #expanded: boolean = false;

  get expanded(): boolean {
    return this.#expanded;
  }

  set expanded(v: boolean) {
    this.#expanded = v;

    if (v) {
      this.setAttribute("expanded", "");
      this.setAttribute("aria-expanded", "true");
    } else {
      this.removeAttribute("expanded");
      this.setAttribute("aria-expanded", "false");
    }
  }

  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");

    style.textContent = `
      :host {
        display: block;
        font: var(--app-font-body);

        -webkit-user-select: none;
        user-select: none;
      }
      :host(:focus) {
        outline: none;
      }

      *, *::before, *::after {
        box-sizing: border-box;
      }

      .label {
        display: flex;
        align-items: center;
        padding: 4px;
        gap: 0.4rem;

        border-radius: var(--app-radii-control);
        cursor: pointer;
      }
      .label:hover, :host(:focus-visible) > .label {
        background-color: hsl(var(--app-color-action-hover));
      }
      .label:active {
        background-color: hsl(var(--app-color-action-active));
      }

      .label > span {
        flex: 1;
      }

      .caret {
        flex-grow: 0;
        flex-shrink: 0;
        width: 0.8rem;
        height: 0.8rem;

        color: hsl(var(--app-color-foreground-dimmed));

        transform: rotate(-90deg);
        transition: transform 0.1s linear;
      }
      :host([expanded]) .caret {
        transform: rotate(0deg);
      }

      .group {
        display: none;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        padding-left: 1.6rem;
        gap: 0.2rem;

        overflow: hidden;
      }

      :host([expanded]) > .group {
        display: flex;
      }
    `;

    shadowRoot.appendChild(style);

    const label = document.createElement("div");
    label.classList.add("label");

    label.innerHTML = `
      <svg class="caret" viewBox="0 -1 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 6L0.535898 0L7.4641 0L4 6Z" fill="currentColor"/>
      </svg>

      <span>
        <slot name="label"></slot>
      </span>
    `;

    label.addEventListener("click", () => {
      this.expanded = !this.#expanded;
      this.focus();
    });

    shadowRoot.appendChild(label);

    const group = document.createElement("div");
    group.role = "group";
    group.classList.add("group");

    const defaultSlot = document.createElement("slot");

    group.appendChild(defaultSlot);

    shadowRoot.appendChild(group);

    this.addEventListener("keydown", (ev) => {
      switch (ev.key) {
        case "Enter":
        case " ": {
          ev.stopPropagation();
          ev.preventDefault();

          this.expanded = !this.#expanded;

          return;
        }
        case "ArrowRight": {
          ev.stopPropagation();
          ev.preventDefault();

          if (this.#expanded) {
            const firstChild = this.#getFirstChild();
            if (firstChild) {
              firstChild.focus();
              return;
            }
          } else {
            this.expanded = true;
          }

          return;
        }
        case "ArrowLeft": {
          ev.stopPropagation();
          ev.preventDefault();

          if (this.#expanded) {
            this.expanded = false;
            return;
          }

          const parent = this.parentElement;
          if (isValidTreeItem(parent)) {
            parent.focus();
            return;
          }

          return;
        }
        case "ArrowUp": {
          ev.preventDefault();
          ev.stopPropagation();

          const prev = this.previousElementSibling;
          if (isValidTreeItem(prev)) {
            prev.focusLastItem();
            this.tabIndex = -1;
            return;
          }

          const parent = this.parentElement;
          if (isValidTreeItem(parent)) {
            parent.focus();
            return;
          }

          return;
        }
        case "ArrowDown": {
          ev.preventDefault();
          ev.stopPropagation();

          if (this.#expanded) {
            const firstChild = this.#getFirstChild();
            if (firstChild) {
              firstChild.focus();
              return;
            }
          }

          this.focusNextItem();
          return;
        }
      }
    });
  }

  connectedCallback() {
    super.connectedCallback();

    const initialExpanded = this.getAttribute("expanded");
    this.expanded = initialExpanded !== null;
  }

  #getFirstChild(): AppTreeGroup | AppTreeItem | null {
    const child = this.querySelector(
      ":scope > app-tree-group:first-of-type, :scope > app-tree-item:first-of-type"
    );
    if (isValidTreeItem(child)) {
      return child;
    }

    return null;
  }

  public focusLastItem() {
    if (!this.#expanded) {
      this.focus();
      return;
    }

    const lastChild = this.querySelector(":scope > :last-child");
    if (!isValidTreeItem(lastChild)) {
      this.focus();
      return;
    }

    lastChild.focusLastItem();
  }
}

export class AppTreeItem extends AppTreeNode {
  static get observedAttributes() {
    return ["selected"] as const;
  }

  attributeChangedCallback(
    name: (typeof AppTreeItem.observedAttributes)[number],
    oldValue: string | null,
    newValue: string | null
  ) {
    if (oldValue === newValue) {
      return;
    }

    switch (name) {
      case "selected": {
        this.selected = newValue !== null;
        return;
      }
    }
  }

  #selected: boolean = false;

  get selected(): boolean {
    return this.#selected;
  }

  set selected(v: boolean) {
    this.#selected = v;

    if (v) {
      this.setAttribute("selected", "");
      this.setAttribute("aria-selected", "true");
    } else {
      this.removeAttribute("selected");
      this.setAttribute("aria-selected", "false");
    }
  }

  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    shadowRoot.innerHTML = `
      <style>
      :host {
        font: var(--app-font-body);
        display: flex;
        align-items: center;
        padding: 4px;
        gap: 0.4rem;

        border-radius: var(--app-radii-control);
        cursor: pointer;
        -webkit-user-select: none;
        user-select: none;
      }
      :host(:focus) {
        outline: none;
      }
      :host(:hover), :host(:focus-visible) {
        background-color: hsl(var(--app-color-action-hover));
      }
      :host(:active) {
        background-color: hsl(var(--app-color-action-active));
      }

      *, *::before, *::after {
        box-sizing: border-box;
      }

      .radio {
        display: block;
        width: 1rem;
        height: 1rem;
        border: 1px solid hsl(var(--app-color-border-level0));

        border-radius: 50%;
      }
      :host([selected]) > .radio {
        border-width: 0.3rem;
        border-color: hsl(var(--app-color-foreground-normal));
      }

      .label {
        flex: 1;
      }
      </style>

      <div class="radio" aria-hidden="true"></div>

      <span class="label"><slot></slot></span>
    `;

    this.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      this.dispatchEvent(new CustomEvent("select"));
      this.focus();
    });

    this.addEventListener("keydown", (ev) => {
      switch (ev.key) {
        case "Enter":
        case " ": {
          ev.stopPropagation();
          ev.preventDefault();

          this.dispatchEvent(new CustomEvent("select"));

          return;
        }
        case "ArrowRight": {
          ev.preventDefault();
          ev.stopPropagation();
          return;
        }
        case "ArrowLeft": {
          ev.stopPropagation();
          ev.preventDefault();

          const parent = this.parentElement;
          if (isValidTreeItem(parent)) {
            parent.focus();
            this.tabIndex = -1;
            return;
          }

          return;
        }
        case "ArrowUp": {
          ev.preventDefault();
          ev.stopPropagation();

          const prev = this.previousElementSibling;
          if (isValidTreeItem(prev)) {
            prev.focusLastItem();
            this.tabIndex = -1;
            return;
          }

          const parent = this.parentElement;
          if (isValidTreeItem(parent)) {
            parent.focus();
            this.tabIndex = -1;
            return;
          }

          return;
        }
        case "ArrowDown": {
          ev.preventDefault();
          ev.stopPropagation();

          this.focusNextItem();
          return;
        }
      }
    });
  }

  public focusLastItem() {
    this.focus();
  }
}
