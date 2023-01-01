const plus = `
  <svg class="plus" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.15152 10V0H5.84848V10H4.15152ZM0 5.84849V4.15151H10V5.84849H0Z" fill="currentColor"/>
  </svg>
`;

const equal = `
  <svg class="equal" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 2.47401V0.720764H10V2.47401H0ZM0 7.27921V5.52596H10V7.27921H0Z" fill="currentColor"/>
  </svg>
`;

export class AppStain extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    shadowRoot.innerHTML = `
      <style>
      :host {
        display: inline-flex;
        justify-content: flex-start;
        align-items: center;
        gap: 8px;
        padding-bottom: 1.6rem;
      }

      slot[name="blended"]::slotted(app-color-swatch) {
        --app-color-swatch--size: 3.2rem;
      }

      .plus, .equal {
        width: 1rem;
        height: auto;
      }

      .slot {
        position: relative;
      }

      ${[1, 2, 3, 4]
        .map((n) => {
          return `
          :host([selected="slot${n}"]) .slot:nth-of-type(${n})::after {
            --_size: 0.4rem;

            content: "";
            display: block;
            position: absolute;
            bottom: calc(-8px - var(--_size));
            left: 0;
            right: 0;
            margin: 0 auto;
            width: var(--_size);
            height: var(--_size);

            background-color: hsl(var(--app-color-foreground-normal));
            border-radius: 50%;
          }
        `;
        })
        .join("\n")}
      </style>

      <div class="slot"><slot name="slot1"></slot></div>
      ${plus}
      <div class="slot"><slot name="slot2"></slot></div>
      ${plus}
      <div class="slot"><slot name="slot3"></slot></div>
      ${plus}
      <div class="slot"><slot name="slot4"></slot></div>
      ${equal}
      <slot name="blended"></slot>
    `;
  }
}
