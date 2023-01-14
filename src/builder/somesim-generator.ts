import { encode } from "./pngs.bundle.js";

function parseMaybeNumber(
  f: (s: string) => number
): (v: string | null) => number | null {
  return (maybeStr) => {
    if (!maybeStr) {
      return null;
    }

    const n = f(maybeStr);

    return isFinite(n) ? n : null;
  };
}

const parseMaybeFloat = parseMaybeNumber(parseFloat);
const parseMaybeRGB = parseMaybeNumber((s) => parseInt(s, 16));
const parseMaybeInt = parseMaybeNumber((s) => parseInt(s, 10));

export class SomesimGenerator extends HTMLElement {
  static get observedAttributes() {
    return [
      "src-a",
      "src-b",
      "frame-a",
      "frame-b",
      "stain-a",
      "stain-b",
      "region-x",
      "region-y",
      "region-width",
      "region-height",
    ] as const;
  }

  #videoA = document.createElement("video");
  #videoB = document.createElement("video");

  #frameA: number | null = null;
  #frameB: number | null = null;

  #stainA: number | null = null;
  #stainB: number | null = null;

  #canvas = document.createElement("canvas");
  #ctx: CanvasRenderingContext2D | null = null;

  #region = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  #objectUrlCache: string[] = [];

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
      video {
        display: none;
      }

      canvas {
        width: 100%;
        height: 100%;
      }
    `;

    shadow.appendChild(style);

    this.#videoA.addEventListener("loadedmetadata", () => {
      if (typeof this.#frameA === "number") {
        this.#videoA.currentTime = this.#frameA;
      }
    });
    this.#videoA.addEventListener("seeked", () => {
      this.#render();
    });
    shadow.appendChild(this.#videoA);
    this.#videoB.addEventListener("loadedmetadata", () => {
      if (typeof this.#frameB === "number") {
        this.#videoB.currentTime = this.#frameB;
      }
    });
    this.#videoB.addEventListener("seeked", () => {
      this.#render();
    });
    shadow.appendChild(this.#videoB);

    shadow.appendChild(this.#canvas);
  }

  connectedCallback() {
    this.#ctx = this.#canvas.getContext("2d");
  }

  disconnectedCallback() {
    for (const url of this.#objectUrlCache) {
      URL.revokeObjectURL(url);
    }

    this.#objectUrlCache = [];
  }

  attributeChangedCallback(
    name: typeof SomesimGenerator.observedAttributes[number],
    oldValue: string | null,
    newValue: string | null
  ) {
    if (oldValue === newValue) {
      return;
    }

    try {
      switch (name) {
        case "src-a": {
          if (newValue) {
            this.#videoA.src = newValue;
            this.#syncVideoA();
          }
          return;
        }
        case "src-b": {
          if (newValue) {
            this.#videoB.src = newValue;
            this.#syncVideoB();
          }
          return;
        }
        case "frame-a": {
          this.#frameA = parseMaybeFloat(newValue);
          this.#syncVideoA();
          return;
        }
        case "frame-b": {
          this.#frameB = parseMaybeFloat(newValue);
          this.#syncVideoB();
          return;
        }
        case "stain-a": {
          this.#stainA = parseMaybeRGB(newValue);
          return;
        }
        case "stain-b": {
          this.#stainB = parseMaybeRGB(newValue);
          return;
        }
        case "region-x": {
          this.#region.x = parseMaybeInt(newValue) ?? this.#region.x;
          return;
        }
        case "region-y": {
          this.#region.y = parseMaybeInt(newValue) ?? this.#region.y;
          return;
        }
        case "region-width": {
          this.#region.width = parseMaybeInt(newValue) ?? this.#region.width;
          return;
        }
        case "region-height": {
          this.#region.height = parseMaybeInt(newValue) ?? this.#region.height;
          return;
        }
      }
    } finally {
      this.#render();
    }
  }

  #syncVideoA() {
    if (!this.#videoA.src || typeof this.#frameA !== "number") {
      return;
    }

    if (this.#videoA.currentTime !== this.#frameA) {
      this.#videoA.currentTime = this.#frameA;
    }
  }

  #syncVideoB() {
    if (!this.#videoB.src || typeof this.#frameB !== "number") {
      return;
    }

    if (this.#videoB.currentTime !== this.#frameB) {
      this.#videoB.currentTime = this.#frameB;
    }
  }

  #render() {
    if (import.meta.env.DEV) {
      console.groupCollapsed("🔍 SomesimGenerator.#render");
      console.log({
        region: this.#region,
        frameA: this.#frameA,
        frameB: this.#frameB,
        stainA: this.#stainA,
        stainB: this.#stainB,
        videoA: this.#videoA.readyState,
        videoB: this.#videoB.readyState,
      });
      console.groupEnd();
    }

    if (
      !this.#ctx ||
      !this.#region.width ||
      !this.#region.height ||
      typeof this.#frameA !== "number" ||
      typeof this.#frameB !== "number" ||
      typeof this.#stainA !== "number" ||
      typeof this.#stainB !== "number" ||
      this.#videoA.readyState < 2 ||
      this.#videoB.readyState < 2
    ) {
      return;
    }

    const { x, y, width, height } = this.#region;

    this.#canvas.width = width;
    this.#canvas.height = height;

    this.style.aspectRatio = `${width} / ${height}`;

    this.#ctx.clearRect(0, 0, width, height);
    this.#ctx.drawImage(this.#videoA, x, y, width, height, 0, 0, width, height);
    const imgA = this.#ctx.getImageData(0, 0, width, height);

    this.#ctx.clearRect(0, 0, width, height);
    this.#ctx.drawImage(this.#videoB, x, y, width, height, 0, 0, width, height);
    const imgB = this.#ctx.getImageData(0, 0, width, height);

    const ar = (this.#stainA >> 16) & 0xff;
    const ag = (this.#stainA >> 8) & 0xff;
    const ab = this.#stainA & 0xff;

    const br = (this.#stainB >> 16) & 0xff;
    const bg = (this.#stainB >> 8) & 0xff;
    const bb = this.#stainB & 0xff;

    // x = 染色後のピクセル (染色液A)
    // a = 染色液Aの色
    // y = 染色後のピクセル (染色液B)
    // b = 染色液Bの色
    // m = 染色係数
    // p = 下地ピクセル
    //
    // 合成計算式:
    // x = p + a * m
    //
    // 染色係数の算出:
    // m = (y - x) / (b - a)
    //
    // 下地ピクセルの算出:
    // p = x - a * m
    for (let i = 0, l = imgA.data.length; i < l; i += 4) {
      const mr = (imgB.data[i]! - imgA.data[i]!) / (br - ar);
      const mg = (imgB.data[i + 1]! - imgA.data[i + 1]!) / (bg - ag);
      const mb = (imgB.data[i + 2]! - imgA.data[i + 2]!) / (bb - ab);

      const m = (mr + mg + mb) / 3;

      imgA.data[i] = imgA.data[i]! - ar * m;
      imgA.data[i + 1] = imgA.data[i + 1]! - ag * m;
      imgA.data[i + 2] = imgA.data[i + 2]! - ab * m;

      // 透明度に係数を保存する
      // * 画像を見た時にどの装備のものかわかりやすいように、非染色部分を不透明にしている (1 - m)
      // * ブラウザやプラットフォームがPNGを圧縮する際に透明ピクセルの色成分が無視されることが
      //   多いため、完全に透明にならないようにしている
      imgA.data[i + 3] = (1 - m) * 254 + 1;
    }

    this.#ctx.putImageData(imgA, 0, 0);

    const png: Uint8Array = encode(imgA.data, width, height);

    const pngFile = new Blob([png], {
      type: "image/png",
    });

    const url = URL.createObjectURL(pngFile);

    this.#objectUrlCache.push(url);

    this.dispatchEvent(
      new CustomEvent("generate", {
        detail: { url },
      })
    );
  }
}
