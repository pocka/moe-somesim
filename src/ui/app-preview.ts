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

        .status {
          padding: 4px 8px;
          margin: 4px 8px;
          min-height: 1.5em;
          font-size: 1.2rem;

          background-color: hsl(0 0% 25%);
          border-radius: 2px;
          color: hsl(0 0% 90%);
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

      <div class="status"><slot name="status"></slot></div>

      <div class="preview">
        <slot></slot>
      </div>
    `;
  }
}
