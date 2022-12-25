export class AppItemListItem extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    shadowRoot.innerHTML = `
      <style>
      :host {
        display: block;
        margin: 2px 0;
      }

      .button {
        display: flex;
        align-items: center;
        gap: 4px;
        border: 1px solid hsl(0 0% 20%);
        font-size: 1.4rem;
        padding: 2px 4px;
        width: 100%;
        box-sizing: border-box;
        line-height: inherit;

        background-color: hsl(0 0% 15%);
        border-radius: 2px;
        color: inherit;
        cursor: pointer;
        text-align: inherit;
      }
      .button:hover {
        background-color: hsl(0 60% 30% / 0.8);
        border-color: hsl(0 60% 30%);
      }
      .button:focus-visible {
        border-color: hsl(0 80% 40%);
        outline: none;
      }

      .check {
        position: relative;
        flex-shrink: 0;
        flex-grow: 0;
        display: block;
        width: 1em;
        height: 1em;
        aspect-ratio: 1 / 1;
        border: 1px solid hsl(0 0% 30%);
        box-sizing: border-box;

        background-color: hsl(0 0% 15% / 0.6);
        border-radius: 50%;
      }
      :host([aria-current="true"]) .check::after {
        content: "";
        display: block;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        margin: auto;
        width: 60%;
        height: 60%;

        background-color: hsl(0 80% 40%);
        border-radius: 50%;
      }

      .text {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      </style>

      <button id="button" class="button">
        <div class="check"></div>

        <span class="text">
          <slot></slot>
        </span>
      </button>
    `;
  }

  connectedCallback() {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "listitem");
    }
  }
}
