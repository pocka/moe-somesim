export class AppLayout extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    shadowRoot.innerHTML = `
      <style>
        :host {
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: min(300px, 30vw) minmax(0, 1fr) 300px;
          grid-template-rows: 100%;

          background-color: hsl(0 0% 15%);
          color: hsl(0 0% 100%);
        }

        .index {
          position: relative;
          padding: 8px;
        }
        .index::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          height: 12px;

          background-color: hsl(0 0% 15%);
          pointer-events: none;
          z-index: 999;
        }

        ::slotted([slot="index"]) {
          width: 100%;
          height: 100%;

          overflow-y: auto;
        }

        .preview {
          background-color: hsl(0 0% 5%);
        }
        ::slotted([slot="preview"]) {
          width: 100%;
          height: 100%;
        }
      </style>

      <div class="index">
        <slot name="index"></slot>
      </div>

      <div class="preview">
        <slot name="preview"></slot>
      </div>

      <div class="controls">
        <slot name="controls"></slot>
      </div>
    `;
  }
}
