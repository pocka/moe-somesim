export class AppPreview extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    shadowRoot.innerHTML = `
      <style>
        :host(app-preview) {
          display: flex;
          flex-direction: column;
        }

        .preview {
          flex: 1;
          display: grid;
          place-items: center;
          font-size: 1.4rem;

          color: hsl(0 0% 80%);
          overflow: hidden;
        }
      </style>

      <div class="preview">
        <slot></slot>
      </div>
    `;
  }
}
