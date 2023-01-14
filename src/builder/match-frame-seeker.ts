import css from "./match-frame-seeker.css?raw";

function parseIntOr(s: string | null, defaultValue: number = 0): number {
  if (!s) {
    return defaultValue;
  }

  const v = parseInt(s, 10);
  if (!isFinite(v)) {
    return defaultValue;
  }

  return v;
}

export class MatchFrameSeeker extends HTMLElement {
  static get observedAttributes() {
    return [
      "a-src",
      "b-src",
      "a-frame",
      "b-frame",
      "region-x",
      "region-y",
      "region-width",
      "region-height",
    ] as const;
  }

  #frameA: number | null = null;

  #srcA: string | null = null;
  #srcB: string | null = null;

  #videoA = document.createElement("video");
  #videoB = document.createElement("video");

  #canvasPreviewA = document.createElement("canvas");
  #ctxPreviewA: CanvasRenderingContext2D | null = null;

  #canvasPreviewB = document.createElement("canvas");
  #ctxPreviewB: CanvasRenderingContext2D | null = null;

  #canvasDiff = document.createElement("canvas");
  #ctxDiff: CanvasRenderingContext2D | null = null;

  #region = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = css;
    shadow.appendChild(style);

    this.#videoA.addEventListener("seeked", () => {
      this.#drawImageA();
      this.#drawDiff();
    });
    this.#videoA.addEventListener("loadeddata", () => {
      this.#drawImageA();
      this.#drawDiff();
    });
    shadow.appendChild(this.#videoA);

    this.#videoB.addEventListener("seeked", () => {
      this.#drawImageB();
      this.#drawDiff();
    });
    this.#videoB.addEventListener("loadeddata", () => {
      this.#drawImageB();
      this.#drawDiff();
    });
    shadow.appendChild(this.#videoB);

    const canvases = document.createElement("div");
    canvases.classList.add("canvases");
    shadow.appendChild(canvases);

    canvases.appendChild(this.#canvasPreviewA);
    canvases.appendChild(this.#canvasPreviewB);
    canvases.appendChild(this.#canvasDiff);

    const controls = document.createElement("div");
    controls.classList.add("controls");
    shadow.appendChild(controls);

    (
      [
        ["-1s", -1],
        ["-1/15s", -(1 / 15)],
        ["-1/30s", -(1 / 30)],
        ["-1/60s", -1 / 60],
        ["+1/60s", 1 / 60],
        ["+1/30s", 1 / 30],
        ["+1/15s", 1 / 15],
        ["+1s", 1],
      ] as const
    ).forEach(([label, amount]) => {
      const button = document.createElement("button");
      button.textContent = label;
      button.classList.add("control");
      button.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        this.#videoB.currentTime = Math.max(
          0,
          Math.min(this.#videoB.duration, this.#videoB.currentTime + amount)
        );
        this.#emitFrameChange();
      });
      controls.appendChild(button);
    });
  }

  connectedCallback() {
    this.#videoA.muted = true;

    this.#ctxPreviewA = this.#canvasPreviewA.getContext("2d");
    this.#ctxPreviewB = this.#canvasPreviewB.getContext("2d");
    this.#ctxDiff = this.#canvasDiff.getContext("2d");

    this.tabIndex = 0;
    this.focus();
  }

  attributeChangedCallback(
    name: typeof MatchFrameSeeker.observedAttributes[number],
    oldValue: string | null,
    newValue: string | null
  ) {
    if (oldValue === newValue) {
      return;
    }

    switch (name) {
      case "a-src": {
        this.#srcA = newValue;
        this.#loadImageA();
        return;
      }
      case "b-src": {
        this.#srcB = newValue;
        this.#loadImageB();
        return;
      }
      case "a-frame": {
        if (!newValue) {
          return;
        }

        const v = parseFloat(newValue);
        if (!isFinite(v)) {
          return;
        }

        this.#frameA = v;
        this.#loadImageA();
        this.#loadImageB();
        return;
      }
      case "b-frame": {
        if (!newValue) {
          return;
        }

        const v = parseFloat(newValue);
        if (!isFinite(v)) {
          return;
        }

        this.#videoB.currentTime = v;
        this.#loadImageB();
        return;
      }
      case "region-x": {
        this.#region.x = parseIntOr(newValue, this.#region.x);
        this.#syncCanvasSize();
        this.#drawImageA();
        this.#drawImageB();
        this.#drawDiff();
        return;
      }
      case "region-y": {
        this.#region.y = parseIntOr(newValue, this.#region.y);
        this.#syncCanvasSize();
        this.#drawImageA();
        this.#drawImageB();
        this.#drawDiff();
        return;
      }
      case "region-width": {
        this.#region.width = parseIntOr(newValue, this.#region.width);
        this.#syncCanvasSize();
        this.#drawImageA();
        this.#drawImageB();
        this.#drawDiff();
        return;
      }
      case "region-height": {
        this.#region.height = parseIntOr(newValue, this.#region.height);
        this.#syncCanvasSize();
        this.#drawImageA();
        this.#drawImageB();
        this.#drawDiff();
        return;
      }
    }
  }

  #loadImageA() {
    if (!this.#srcA || typeof this.#frameA !== "number") {
      return;
    }

    if (import.meta.env.DEV) {
      console.groupCollapsed("🔍 MatchFrameSeeker.loadImageA");
      console.log(this.#srcA);
      console.log(this.#frameA);
      console.groupEnd();
    }

    const frameA = this.#frameA;

    if (this.#videoA.src !== this.#srcA) {
      this.#videoA.src = this.#srcA;
    }

    this.#videoA.currentTime = frameA;
  }

  #loadImageB() {
    if (!this.#srcB) {
      return;
    }

    if (import.meta.env.DEV) {
      console.groupCollapsed("🔍 MatchFrameSeeker.loadImageB");
      console.log(this.#srcB);
      console.groupEnd();
    }

    if (this.#videoB.src !== this.#srcB) {
      this.#videoB.src = this.#srcB;
    }

    // 完全一致するわけではないが、近い可能性があるので同じフレームから開始する
    if (typeof this.#frameA === "number" && !this.hasAttribute("b-frame")) {
      this.#videoB.currentTime = this.#frameA;
      this.#emitFrameChange();
    }
  }

  #syncCanvasSize() {
    if (!this.#region.width || !this.#region.height) {
      return;
    }

    const { width, height } = this.#region;

    if (import.meta.env.DEV) {
      console.groupCollapsed("🔍 MatchFrameSeeker.syncCanvasSize");
      console.log(this.#region);
      console.groupEnd();
    }

    this.#canvasPreviewA.width = width;
    this.#canvasPreviewA.height = height;

    this.#canvasPreviewB.width = width;
    this.#canvasPreviewB.height = height;

    this.#canvasDiff.width = width;
    this.#canvasDiff.height = height;
  }

  #drawImageA() {
    if (!this.#region.width || !this.#region.height) {
      return;
    }

    if (import.meta.env.DEV) {
      console.groupCollapsed("🔍 MatchFrameSeeker.drawImageA");
      console.log(this.#region);
      console.groupEnd();
    }

    const { x, y, width, height } = this.#region;

    this.#ctxPreviewA?.drawImage(
      this.#videoA,
      x,
      y,
      width,
      height,
      0,
      0,
      width,
      height
    );
  }

  #drawImageB() {
    if (!this.#region.width || !this.#region.height) {
      return;
    }

    if (import.meta.env.DEV) {
      console.groupCollapsed("🔍 MatchFrameSeeker.drawImageB");
      console.log(this.#region);
      console.groupEnd();
    }

    const { x, y, width, height } = this.#region;

    this.#ctxPreviewB?.drawImage(
      this.#videoB,
      x,
      y,
      width,
      height,
      0,
      0,
      width,
      height
    );
  }

  #drawDiff() {
    if (
      !this.#ctxDiff ||
      !this.#region.width ||
      !this.#region.height ||
      this.#videoA.readyState <= 2 ||
      this.#videoB.readyState <= 2
    ) {
      return;
    }

    const { x, y, width, height } = this.#region;

    this.#ctxDiff.clearRect(0, 0, width, height);
    this.#ctxDiff.drawImage(
      this.#videoA,
      x,
      y,
      width,
      height,
      0,
      0,
      width,
      height
    );
    const imgA = this.#ctxDiff.getImageData(0, 0, width, height);

    this.#ctxDiff.clearRect(0, 0, width, height);
    this.#ctxDiff.drawImage(
      this.#videoB,
      x,
      y,
      width,
      height,
      0,
      0,
      width,
      height
    );
    const imgB = this.#ctxDiff.getImageData(0, 0, width, height);

    for (let i = 0, l = imgA.data.length; i < l; i += 4) {
      imgA.data[i] = Math.abs(imgA.data[i]! - imgB.data[i]!);
      imgA.data[i + 1] = Math.abs(imgA.data[i + 1]! - imgB.data[i + 1]!);
      imgA.data[i + 2] = Math.abs(imgA.data[i + 2]! - imgB.data[i + 2]!);
    }

    this.#ctxDiff.putImageData(imgA, 0, 0);
  }

  #emitFrameChange() {
    this.dispatchEvent(
      new CustomEvent("frame-change", {
        detail: {
          frame: this.#videoB.currentTime,
        },
      })
    );
  }
}
