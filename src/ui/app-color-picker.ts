import css from "./app-color-picker.css?raw";

const enum DragStateType {
  Idle = 0,
  DraggingHue,
  DraggingSL,
}

type DragState =
  | {
      type: DragStateType.Idle;
    }
  | {
      type: DragStateType.DraggingHue;
      cx: number;
      cy: number;

      startX: number;
      startY: number;

      /** ドラッグ開始時点の色相値 */
      startHue: number;
    }
  | {
      type: DragStateType.DraggingSL;

      /** 操作領域の始点(X) */
      x: number;
      /** 操作領域の始点(Y) */
      y: number;
      /** 操作領域の幅 */
      width: number;
      /** 操作領域の高さ */
      height: number;

      /** ドラッグ開始時点の彩度 */
      startSaturation: number;
      /** ドラッグ開始時点の明度 */
      startLightness: number;
    };

function getAngleBetweenVectorsInDegrees(
  ax: number,
  ay: number,
  bx: number,
  by: number
): number {
  // https://wumbo.net/formulas/angle-between-two-vectors-2d/
  // θ=atan2(w2×v1−w1×v2, w1×v1+w2×v2)
  const r = Math.atan2(by * ax - bx * ay, bx * ax + by * ay);

  return (180 / Math.PI) * r;
}

/**
 * HSLからHSVに変換する
 *
 * Hは共通で変わりないためSL/SVの変換のみ行う。
 * <https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_HSV>
 */
function slToSV(s: number, l: number): [number, number] {
  const v = l + s * Math.min(l, 1 - l);
  const sv = v === 0 ? 0 : 2 * (1 - l / v);

  return [sv, v];
}

/**
 * HSVからHSLに変換する
 *
 * Hは共通で変わりないためSL/SVの変換のみ行う。
 * <https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_HSL>
 */
function svToSL(s: number, v: number): [number, number] {
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);

  return [sl, l];
}

export class AppColorPicker extends HTMLElement {
  static get observedAttributes() {
    return ["hue", "saturation", "lightness"];
  }

  attributeChangedCallback(
    name: (typeof AppColorPicker.observedAttributes)[number],
    oldValue: string | null,
    newValue: string | null
  ) {
    if (oldValue === newValue) {
      return;
    }

    switch (name) {
      case "hue": {
        if (typeof newValue !== "string") {
          return;
        }

        const hue = parseInt(newValue);
        if (!isFinite(hue)) {
          return;
        }

        this.#hue = hue;
        this.#applyHueToElements();
        return;
      }
      case "saturation": {
        if (typeof newValue !== "string") {
          return;
        }

        const saturation = parseFloat(newValue);
        if (!isFinite(saturation)) {
          return;
        }

        this.#saturation = saturation;
        this.#applySLToElements();
        return;
      }
      case "lightness": {
        if (typeof newValue !== "string") {
          return;
        }

        const lightness = parseFloat(newValue);
        if (!isFinite(lightness)) {
          return;
        }

        this.#lightness = lightness;
        this.#applySLToElements();
        return;
      }
    }
  }

  #hueControl = document.createElement("div");
  #hueKnob = document.createElement("div");
  #slArea = document.createElement("div");
  #slControl = document.createElement("div");
  #slKnob = document.createElement("div");

  #dragState: DragState = { type: DragStateType.Idle };

  #hue: number = 0;
  #saturation: number = 0;
  #lightness: number = 0;

  get hue() {
    return ((this.#hue % 360) + 360) % 360 | 0;
  }

  set hue(v: number) {
    if (this.#hue === v) {
      return;
    }

    this.#hue = v;
    this.#applyHueToElements();
  }

  /**
   * 0.0 ~ 1.0
   */
  get saturation() {
    return this.#saturation;
  }

  set saturation(v: number) {
    if (this.#saturation === v) {
      return;
    }

    this.#saturation = v;
    this.#applySLToElements();
  }

  /**
   * 0.0 ~ 1.0
   */
  get lightness() {
    return this.#lightness;
  }

  set lightness(v: number) {
    if (this.#lightness === v) {
      return;
    }

    this.#lightness = v;
    this.#applySLToElements();
  }

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = css;

    shadow.appendChild(style);

    const hueBg = document.createElement("div");
    hueBg.classList.add("hue-bg");
    shadow.appendChild(hueBg);

    this.#hueKnob.classList.add("hue-knob");

    const onHueControlDragStart = (
      el: HTMLElement,
      pageX: number,
      pageY: number
    ) => {
      const { x, y, width, height } = el.getBoundingClientRect();

      const cx = x + width * 0.5;
      const cy = y + height * 0.5;

      const ax = pageX - cx;
      const ay = pageY - cy;

      this.#hue = getAngleBetweenVectorsInDegrees(0, -1, ax, ay);

      this.#dragState = {
        type: DragStateType.DraggingHue,
        cx,
        cy,
        startX: ax,
        startY: ay,
        startHue: this.hue,
      };

      this.#applyHueToElements();
      this.#emitInputEvent();
    };

    this.#hueControl.classList.add("hue-control");
    this.#hueControl.addEventListener("mousedown", (ev) => {
      // 主ボタン以外の場合はドラッグを開始しない
      if (ev.button !== 0) {
        return;
      }

      document.documentElement.style.cursor = "grabbing";
      this.#hueKnob.style.cursor = "none";

      ev.preventDefault();
      ev.stopPropagation();

      onHueControlDragStart(
        ev.currentTarget as HTMLDivElement,
        ev.pageX,
        ev.pageY
      );
    });
    this.#hueControl.addEventListener("touchstart", (ev) => {
      // シングルタッチのみハンドルする
      if (ev.touches.length !== 1) {
        return;
      }

      const touch = ev.touches.item(0);
      if (!touch) {
        return;
      }

      ev.preventDefault();
      ev.stopPropagation();

      onHueControlDragStart(
        ev.currentTarget as HTMLDivElement,
        touch.pageX,
        touch.pageY
      );
    });
    this.#hueControl.appendChild(this.#hueKnob);
    shadow.appendChild(this.#hueControl);

    const hueHole = document.createElement("div");
    hueHole.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
    });
    hueHole.classList.add("hue-hole");
    shadow.appendChild(hueHole);

    this.#slControl.classList.add("sl-control");

    this.#slKnob.classList.add("sl-knob");

    const onSlAreaDragStart = (
      el: HTMLElement,
      pageX: number,
      pageY: number
    ) => {
      const { x, y, width, height } = el.getBoundingClientRect();

      this.#dragState = {
        type: DragStateType.DraggingSL,
        x,
        y,
        width,
        height,
        startSaturation: this.saturation,
        startLightness: this.lightness,
      };

      const ax = (pageX - x) / width;
      const ay = (pageY - y) / height;

      const [s, l] = svToSL(ax, 1 - ay);

      this.#saturation = s;
      this.#lightness = l;
      this.#applySLToElements();
      this.#emitInputEvent();
    };

    this.#slArea.classList.add("sl-area");
    this.#slArea.addEventListener("mousedown", (ev) => {
      // 主ボタン以外の場合はドラッグを開始しない
      if (ev.button !== 0) {
        return;
      }

      document.documentElement.style.cursor = "grabbing";
      this.#slKnob.style.cursor = "none";
      this.#slKnob.dataset.active = "true";

      onSlAreaDragStart(ev.currentTarget as HTMLDivElement, ev.pageX, ev.pageY);
    });
    this.#slArea.addEventListener("touchstart", (ev) => {
      // シングルタッチのみハンドルする
      if (ev.touches.length !== 1) {
        return;
      }

      const touch = ev.touches.item(0);
      if (!touch) {
        return;
      }

      ev.preventDefault();
      ev.stopPropagation();

      onSlAreaDragStart(
        ev.currentTarget as HTMLDivElement,
        touch.pageX,
        touch.pageY
      );
    });

    this.#slControl.appendChild(this.#slKnob);
    this.#slArea.appendChild(this.#slControl);
    shadow.appendChild(this.#slArea);
  }

  connectedCallback() {
    const hue = parseInt(this.getAttribute("hue") || "");
    if (isFinite(hue)) {
      this.#hue = hue;
    }

    const saturation = parseFloat(this.getAttribute("saturation") || "");
    if (isFinite(saturation)) {
      this.#saturation = saturation;
    }

    const lightness = parseFloat(this.getAttribute("lightness") || "");
    if (isFinite(lightness)) {
      this.#lightness = lightness;
    }

    this.#applyHueToElements();
    this.#applySLToElements();

    document.addEventListener("mousemove", this.#onDocumentPointerMove);
    document.addEventListener("touchmove", this.#onDocumentPointerMove);

    document.addEventListener("mouseup", this.#onDocumentPointerEnd);
    document.addEventListener("mouseleave", this.#onDocumentPointerMove);
    document.addEventListener("touchcancel", this.#onDocumentPointerEnd);
    document.addEventListener("touchend", this.#onDocumentPointerEnd);

    document.addEventListener("keydown", this.#onDocumentKeydown);
  }

  disconnectedCallback() {
    document.removeEventListener("mousemove", this.#onDocumentPointerMove);
    document.removeEventListener("touchmove", this.#onDocumentPointerMove);

    document.removeEventListener("mouseup", this.#onDocumentPointerEnd);
    document.removeEventListener("mouseleave", this.#onDocumentPointerMove);
    document.removeEventListener("touchcancel", this.#onDocumentPointerEnd);
    document.removeEventListener("touchend", this.#onDocumentPointerEnd);

    document.removeEventListener("keydown", this.#onDocumentKeydown);
  }

  #onDocumentPointerMove = (ev: MouseEvent | TouchEvent) => {
    switch (this.#dragState.type) {
      case DragStateType.Idle:
        return;
      case DragStateType.DraggingHue: {
        ev.preventDefault();
        ev.stopPropagation();

        let pageX: number;
        let pageY: number;
        if ("touches" in ev) {
          const touch = ev.touches.item(0);
          if (!touch) {
            return;
          }

          pageX = touch.pageX;
          pageY = touch.pageY;
        } else {
          pageX = ev.pageX;
          pageY = ev.pageY;
        }

        const { cx, cy, startX, startY, startHue } = this.#dragState;

        // 中心座標から現在のポインターの位置へのベクトル
        const bx = pageX - cx;
        const by = pageY - cy;

        const degree = getAngleBetweenVectorsInDegrees(startX, startY, bx, by);

        if (Number.isFinite(degree)) {
          this.#hue = startHue + degree;

          this.#applyHueToElements();
          this.#emitInputEvent();
        }

        return;
      }
      case DragStateType.DraggingSL: {
        let pageX: number;
        let pageY: number;
        if ("touches" in ev) {
          const touch = ev.touches.item(0);
          if (!touch) {
            return;
          }

          pageX = touch.pageX;
          pageY = touch.pageY;
        } else {
          pageX = ev.pageX;
          pageY = ev.pageY;
        }

        ev.preventDefault();
        ev.stopPropagation();

        const { x, y, width, height } = this.#dragState;
        const ax = Math.min(1, Math.max(0, (pageX - x) / width));
        const ay = Math.min(1, Math.max(0, (pageY - y) / height));

        // NOTE: HSVはV=0やV=1 (かつSが特定の値) の場合にHSLへ変換するとSが常に0になってしまう (0除算避け)。
        //       それを防ぐために小数点を使ってギリギリ0除算が起きないような値にしている。
        const [s, l] = svToSL(
          ax,
          Math.min(0.999999999, Math.max(0.00000001, 1 - ay))
        );

        this.#saturation = s;
        this.#lightness = l;
        this.#applySLToElements();
        this.#emitInputEvent();
        return;
      }
    }
  };

  #endDrag() {
    this.#dragState = { type: DragStateType.Idle };

    document.documentElement.style.cursor = "";
    this.#hueKnob.style.cursor = "";
    this.#slKnob.style.cursor = "";
    this.#slKnob.dataset.active = "false";
  }

  #onDocumentPointerEnd = (_ev: Event) => {
    if (this.#dragState.type === DragStateType.Idle) {
      return;
    }

    this.#endDrag();
    this.#emitChangeEvent();
  };

  #onDocumentKeydown = (ev: KeyboardEvent) => {
    if (ev.key !== "Escape") {
      return;
    }

    switch (this.#dragState.type) {
      case DragStateType.Idle:
        return;

      case DragStateType.DraggingHue: {
        ev.preventDefault();
        ev.stopPropagation();

        this.hue = this.#dragState.startHue;
        this.#emitInputEvent();
        this.#endDrag();
        this.#emitCancelEvent();
        return;
      }
      case DragStateType.DraggingSL: {
        ev.preventDefault();
        ev.stopPropagation();

        this.#saturation = this.#dragState.startSaturation;
        this.#lightness = this.#dragState.startLightness;
        this.#applySLToElements();
        this.#emitInputEvent();
        this.#endDrag();
        this.#emitCancelEvent();

        return;
      }
    }
  };

  #applyHueToElements() {
    const hue = this.#hue;
    const s = this.#saturation;
    const l = this.#lightness;

    this.#hueControl.style.transform = `rotate(${hue}deg)`;
    this.#hueKnob.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
    this.#slArea.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
    this.#slKnob.style.backgroundColor = `hsl(${hue}, ${s * 100}%, ${
      l * 100
    }%)`;
  }

  #applySLToElements() {
    const h = this.#hue;
    const s = this.#saturation;
    const l = this.#lightness;

    const [sv, v] = slToSV(s, l);

    this.#slControl.style.transform = `translate(${sv * 100}%, ${
      (1 - v) * 100
    }%)`;
    this.#slKnob.style.backgroundColor = `hsl(${h}, ${s * 100}%, ${l * 100}%)`;
  }

  #emitInputEvent() {
    this.dispatchEvent(
      new CustomEvent("app-color-input", {
        detail: {
          hue: this.hue,
          saturation: this.saturation,
          lightness: this.lightness,
        },
      })
    );
  }

  #emitChangeEvent() {
    this.dispatchEvent(
      new CustomEvent("app-color-change", {
        detail: {
          hue: this.hue,
          saturation: this.saturation,
          lightness: this.lightness,
        },
      })
    );
  }

  #emitCancelEvent() {
    this.dispatchEvent(
      new CustomEvent("app-color-cancel", {
        detail: {
          hue: this.hue,
          saturation: this.saturation,
          lightness: this.lightness,
        },
      })
    );
  }
}
