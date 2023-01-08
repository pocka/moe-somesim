export class AppPreview extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    shadowRoot.innerHTML = `
      <style>
        :host(app-preview) {
          display: flex;
          flex-direction: column;
          max-width: 100%;
          max-height: 100%;
          min-width: 0;
          min-height: 0;
          width: 100%;
          height: 100%;
        }

        .preview {
          flex: 1;
          display: grid;
          grid-template-columns: 100%;
          grid-template-rows: 100%;
          place-items: center;
          font-size: 1.4rem;
          padding: 4px;

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
