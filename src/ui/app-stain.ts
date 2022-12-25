export class AppStain extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    shadowRoot.innerHTML = `
      <style>
      :host {
        display: block;
        padding: 4px 8px;
        border: 1px solid hsl(0 0% 15%);

        border-radius: 4px;
      }

      .label {
        font-size: 1.2rem;
        font-weight: bold;
      }

      .slots {
        display: grid;
        grid-template-columns: repeat(4, 2.4rem);
        grid-template-rows: 2.4rem;
        gap: 0.2rem;
        padding: 0;
        margin: 0;
      }
      </style>

      <div class="label">
        <slot name="label"><span>染色液</span></slot>
      </div>

      <div><slot name="blended"></slot></div>

      <ul class="slots">
        <slot></slot>
      </ul>
    `;
  }
}
