function factory(svg: string, label: string) {
  return class extends HTMLElement {
    constructor() {
      super();

      const shadowRoot = this.attachShadow({ mode: "open" });

      shadowRoot.innerHTML = `
        <style>
        :host {
          display: inline-flex;
          aspect-ratio: 1 / 1;
        }

        svg {
          width: auto;
          height: 1em;
        }
        </style>

        ${svg}
      `;
    }

    connectedCallback() {
      if (!this.hasAttribute("role")) {
        this.setAttribute("role", "img");
      }

      if (!this.hasAttribute("aria-label")) {
        const finalLabel = this.getAttribute("label") || label;

        this.setAttribute("aria-label", finalLabel);
      }
    }
  };
}

export const AppIconShirt = factory(
  `
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 12.5578C0 12.5578 5.55714 9.00516 8.6168 4H11.4522C11.4522 4 11.6732 6.28209 16.3867 6.28209C21.1001 6.28209 21.3211 4 21.3211 4H23.5673C26.6684 8.30709 32 12.5578 32 12.5578L27.9862 16.7417L23.0518 12.0254L23.8987 28H8.32221L9.20599 12.0254L4.23476 16.7417L0 12.5578Z" fill="currentColor"/>
    </svg>
  `,
  "衣服"
);

export const AppIconFrasco = factory(
  `
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M9.52143 1L22.4786 1.00002V13.8712L32 31L0 31L9.52143 13.8711V1ZM12.8172 4.33333V14.7439L10.0698 19.6865L5.63382 27.6667L26.3662 27.6667L21.2233 18.4148L19.1828 14.7439V4.33334L12.8172 4.33333Z" fill="currentColor"/>
      <path d="M12.4235 21.6289C12.847 22.0215 13.4711 22.0215 13.8945 21.6289C14.3565 21.2006 14.3565 20.4341 13.8945 20.0058C13.4711 19.6132 12.847 19.6132 12.4235 20.0058C11.9615 20.4341 11.9615 21.2006 12.4235 21.6289Z" fill="currentColor"/>
      <path d="M12.2882 24.8842C12.4704 24.7153 12.7387 24.7153 12.9208 24.8842C13.1195 25.0684 13.1195 25.398 12.9208 25.5821C12.7387 25.751 12.4704 25.751 12.2882 25.5821C12.0896 25.398 12.0896 25.0684 12.2882 24.8842Z" fill="currentColor"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12.8172 14.7439V4.33333L19.1828 4.33334V14.7439L21.2233 18.4148C21.2233 18.4148 21.2233 19.6865 19.4552 19.6865C18.5194 19.6865 17.772 19.294 17.0109 18.8944C16.3748 18.5604 15.7291 18.2214 14.9559 18.1022C12.6338 17.7445 10.0698 19.6865 10.0698 19.6865L12.8172 14.7439ZM17.8044 17.8076C17.6165 17.6229 17.6165 17.3136 17.8044 17.129C17.987 16.9496 18.2736 16.9496 18.4562 17.129C18.6441 17.3136 18.6441 17.6229 18.4562 17.8076C18.2736 17.9869 17.987 17.9869 17.8044 17.8076Z" fill="currentColor"/>
    </svg>
  `,
  "フラスコ"
);

export const AppIconCollapse = factory(
  `
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M3 16L15.7255 3.00001L17.2858 4.62333L6.14935 16L17.2858 27.3767L15.7255 29L3 16ZM14.7142 16L27.4397 3L29 4.62332L17.8635 16L29 27.3767L27.4397 29L14.7142 16Z" fill="currentColor"/>
  </svg>
  `,
  "二重矢印"
);
