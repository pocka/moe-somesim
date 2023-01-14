import css from "./video-cropper.css?raw";

function maybeFloatToString(v: string | null): number | null {
  if (!v) {
    return null;
  }

  const n = parseFloat(v);

  return isFinite(n) ? n : null;
}

function maybeIntToString(v: string | null): number | null {
  if (!v) {
    return null;
  }

  const n = parseInt(v, 10);

  return isFinite(n) ? n : null;
}

const DEFAULT_REGION_SIZE = 400;
const MIN_REGION_SIZE = 100;

const enum DragTarget {
  Nothing = 0,
  Region,
  TopLeftHandle,
  TopCenterHandle,
  TopRightHandle,
  MiddleLeftHandle,
  MiddleRightHandle,
  BottomLeftHandle,
  BottomCenterHandle,
  BottomRightHandle,
}

export class VideoCropper extends HTMLElement {
  static get observedAttributes() {
    return [
      "video-src",
      "video-frame",
      "region-x",
      "region-y",
      "region-width",
      "region-height",
    ] as const;
  }

  attributeChangedCallback(
    name: typeof VideoCropper.observedAttributes[number],
    oldValue: string | null,
    newValue: string | null
  ) {
    if (oldValue === newValue) {
      return;
    }

    switch (name) {
      case "video-src": {
        this.#videoSrc = newValue;
        this.#configureVideoEl();
        return;
      }
      case "video-frame": {
        this.#videoFrame = maybeFloatToString(newValue);
        this.#configureVideoEl();
        return;
      }
      case "region-x": {
        if (this.#dragTarget !== DragTarget.Nothing) {
          return;
        }

        this.#region.x = maybeIntToString(newValue) ?? this.#region.x;
        this.#syncRegionEl();
        return;
      }
      case "region-y": {
        if (this.#dragTarget !== DragTarget.Nothing) {
          return;
        }

        this.#region.y = maybeIntToString(newValue) ?? this.#region.y;
        this.#syncRegionEl();
        return;
      }
      case "region-width": {
        if (this.#dragTarget !== DragTarget.Nothing) {
          return;
        }

        this.#region.width = maybeIntToString(newValue) ?? this.#region.width;
        this.#syncRegionEl();
        return;
      }
      case "region-height": {
        if (this.#dragTarget !== DragTarget.Nothing) {
          return;
        }

        this.#region.height = maybeIntToString(newValue) ?? this.#region.height;
        this.#syncRegionEl();
        return;
      }
    }
  }

  #videoSrc: string | null = null;
  #videoFrame: number | null = null;

  #videoSize: { width: number; height: number; elScale: number } | null = null;
  #region: { x: number; y: number; width: number; height: number } = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  #dragTarget: DragTarget = DragTarget.Nothing;

  #videoEl = document.createElement("video");
  #regionEl = document.createElement("div");

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = css;
    shadow.appendChild(style);

    this.#videoEl.addEventListener("loadeddata", () => {
      const { videoWidth: width, videoHeight: height } = this.#videoEl;

      if (!width || !height) {
        return;
      }

      const box = this.#videoEl.getBoundingClientRect();

      this.#videoSize = { width, height, elScale: box.width / width };

      // 高さや幅は通常に操作した場合0にはなりえないため、0=未設定とみなせる
      if (!this.#region.width || !this.#region.height) {
        this.#region = {
          x: Math.round(width / 2 - DEFAULT_REGION_SIZE / 2),
          y: Math.round(height / 2 - DEFAULT_REGION_SIZE / 2),
          width: DEFAULT_REGION_SIZE,
          height: DEFAULT_REGION_SIZE,
        };
      }

      this.#syncRegionEl();
    });
    shadow.appendChild(this.#videoEl);

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    shadow.appendChild(overlay);

    this.#regionEl.classList.add("region");
    this.#regionEl.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();

      this.#dragTarget = DragTarget.Region;
      document.documentElement.style.cursor = "none";
      this.#regionEl.style.cursor = "none";
    });
    shadow.appendChild(this.#regionEl);

    for (const target of [
      DragTarget.TopLeftHandle,
      DragTarget.TopCenterHandle,
      DragTarget.TopRightHandle,
      DragTarget.MiddleLeftHandle,
      DragTarget.MiddleRightHandle,
      DragTarget.BottomLeftHandle,
      DragTarget.BottomCenterHandle,
      DragTarget.BottomRightHandle,
    ] as const) {
      const el = document.createElement("div");
      el.classList.add("handle");
      const [position, cursor] = (() => {
        switch (target) {
          case DragTarget.TopLeftHandle:
            return ["top left", "nwse-resize"];
          case DragTarget.TopCenterHandle:
            return ["top center", "ns-resize"];
          case DragTarget.TopRightHandle:
            return ["top right", "nesw-resize"];
          case DragTarget.MiddleLeftHandle:
            return ["middle left", "ew-resize"];
          case DragTarget.MiddleRightHandle:
            return ["middle right", "ew-resize"];
          case DragTarget.BottomLeftHandle:
            return ["bottom left", "nesw-resize"];
          case DragTarget.BottomCenterHandle:
            return ["bottom center", "ns-resize"];
          case DragTarget.BottomRightHandle:
            return ["bottom right", "nwse-resize"];
        }
      })();
      el.dataset.position = position;
      el.style.cursor = cursor;

      el.addEventListener("pointerdown", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        this.#dragTarget = target;
      });

      this.#regionEl.appendChild(el);
    }
  }

  connectedCallback() {
    this.#videoSrc = this.getAttribute("video-src");
    this.#videoFrame = maybeFloatToString(this.getAttribute("video-frame"));

    this.#videoEl.muted = true;
    this.#videoEl.style.pointerEvents = "none";

    this.#region.x =
      maybeFloatToString(this.getAttribute("region-x")) ?? this.#region.x;
    this.#region.y =
      maybeFloatToString(this.getAttribute("region-y")) ?? this.#region.y;
    this.#region.width =
      maybeFloatToString(this.getAttribute("region-width")) ??
      this.#region.width;
    this.#region.height =
      maybeFloatToString(this.getAttribute("region-height")) ??
      this.#region.height;

    document.addEventListener("pointercancel", this.#onPointerCancel);
    document.addEventListener("pointerup", this.#onPointerUp);
    document.addEventListener("pointermove", this.#onPointerMove, {
      passive: true,
    });

    this.#configureVideoEl();
  }

  disconnectedCallback() {
    document.removeEventListener("pointercancel", this.#onPointerCancel);
    document.removeEventListener("pointerup", this.#onPointerUp);
    document.removeEventListener("pointermove", this.#onPointerMove);
  }

  #configureVideoEl(): void {
    if (!this.#videoSrc || typeof this.#videoFrame !== "number") {
      return;
    }

    this.#videoEl.src = this.#videoSrc;
    this.#videoEl.currentTime = this.#videoFrame;
    this.#videoEl.pause();
  }

  #syncRegionEl(): void {
    if (!this.#videoSize) {
      return;
    }

    const { width: vw, height: vh } = this.#videoSize;
    const { x, y, width: w, height: h } = this.#region;

    this.#regionEl.style.left = `${(x / vw) * 100}%`;
    this.#regionEl.style.top = `${(y / vh) * 100}%`;
    this.#regionEl.style.width = `${(w / vw) * 100}%`;
    this.#regionEl.style.height = `${(h / vh) * 100}%`;
  }

  #emitResizeEvent(): void {
    this.dispatchEvent(
      new CustomEvent("region-resize", {
        detail: {
          x: Math.round(this.#region.x),
          y: Math.round(this.#region.y),
          width: Math.round(this.#region.width),
          height: Math.round(this.#region.height),
        },
      })
    );
  }

  #endDrag(): void {
    document.documentElement.style.cursor = "";
    this.#regionEl.style.cursor = "";

    this.#dragTarget = DragTarget.Nothing;
  }

  #moveBy(tx: number, ty: number): void {
    if (!this.#videoSize) {
      return;
    }

    this.#region.x = Math.max(
      0,
      Math.min(this.#videoSize.width - this.#region.width, this.#region.x + tx)
    );
    this.#region.y = Math.max(
      0,
      Math.min(
        this.#videoSize.height - this.#region.height,
        this.#region.y + ty
      )
    );
  }

  #resizeBy(dw: number, dh: number, vx: number, vy: number): void {
    if (!this.#videoSize) {
      return;
    }

    const { x, y, width, height } = this.#region;

    const canIncreaseWidth = vx > 0 ? x < this.#videoSize.width - width : x > 0;

    const nextW =
      dw < 0 || canIncreaseWidth
        ? Math.max(MIN_REGION_SIZE, Math.min(this.#videoSize.width, width + dw))
        : width;

    const canIncreaseHeight =
      vy > 0 ? y < this.#videoSize.height - height : y > 0;

    const nextH =
      dh < 0 || canIncreaseHeight
        ? Math.max(
            MIN_REGION_SIZE,
            Math.min(this.#videoSize.height, height + dh)
          )
        : height;

    const offsetX = vx > 0 ? 0 : width - nextW;
    const offsetY = vy > 0 ? 0 : height - nextH;

    this.#region.width = nextW;
    this.#region.height = nextH;
    this.#moveBy(offsetX, offsetY);
  }

  #onPointerCancel = (ev: PointerEvent) => {
    ev.preventDefault();

    this.#endDrag();
  };

  #onPointerUp = (ev: PointerEvent) => {
    ev.preventDefault();

    this.#endDrag();
    this.#emitResizeEvent();
  };

  #onPointerMove = (ev: PointerEvent) => {
    if (!this.#videoSize) {
      return;
    }

    switch (this.#dragTarget) {
      case DragTarget.Region: {
        this.#moveBy(
          ev.movementX / this.#videoSize.elScale,
          ev.movementY / this.#videoSize.elScale
        );

        this.#syncRegionEl();

        return;
      }
      case DragTarget.TopLeftHandle: {
        this.#resizeBy(
          -ev.movementX / this.#videoSize.elScale,
          -ev.movementY / this.#videoSize.elScale,
          -1,
          -1
        );

        this.#syncRegionEl();
        this.#emitResizeEvent();
        return;
      }
      case DragTarget.TopRightHandle: {
        this.#resizeBy(
          ev.movementX / this.#videoSize.elScale,
          -ev.movementY / this.#videoSize.elScale,
          1,
          -1
        );

        this.#syncRegionEl();
        this.#emitResizeEvent();

        return;
      }
      case DragTarget.BottomLeftHandle: {
        this.#resizeBy(
          -ev.movementX / this.#videoSize.elScale,
          ev.movementY / this.#videoSize.elScale,
          -1,
          1
        );
        this.#syncRegionEl();
        this.#emitResizeEvent();

        return;
      }
      case DragTarget.BottomRightHandle: {
        this.#resizeBy(
          ev.movementX / this.#videoSize.elScale,
          ev.movementY / this.#videoSize.elScale,
          1,
          1
        );
        this.#syncRegionEl();
        this.#emitResizeEvent();

        return;
      }
      case DragTarget.TopCenterHandle: {
        this.#resizeBy(0, -ev.movementY / this.#videoSize.elScale, 0, -1);
        this.#syncRegionEl();
        this.#emitResizeEvent();

        return;
      }
      case DragTarget.BottomCenterHandle: {
        this.#resizeBy(0, ev.movementY / this.#videoSize.elScale, 0, 1);
        this.#syncRegionEl();
        this.#emitResizeEvent();

        return;
      }
      case DragTarget.MiddleLeftHandle: {
        this.#resizeBy(-ev.movementX / this.#videoSize.elScale, 0, -1, 0);
        this.#syncRegionEl();
        this.#emitResizeEvent();

        return;
      }
      case DragTarget.MiddleRightHandle: {
        this.#resizeBy(ev.movementX / this.#videoSize.elScale, 0, 1, 0);
        this.#syncRegionEl();
        this.#emitResizeEvent();

        return;
      }
    }
  };
}
