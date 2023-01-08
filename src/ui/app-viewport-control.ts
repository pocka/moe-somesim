const enum TouchStateKind {
  Idle = 0,
  Pan,
  Pinch,
}

type TouchState =
  | {
      kind: TouchStateKind.Idle;
    }
  | {
      kind: TouchStateKind.Pan;
      prevX: number;
      prevY: number;
    }
  | {
      kind: TouchStateKind.Pinch;
      prevD: number;
      startScale: number;
    };

export class AppViewportControl extends HTMLElement {
  #touch: TouchState = { kind: TouchStateKind.Idle };

  #scaleMax: number = 3;
  #scaleMin: number = 0.3;

  #x: number = 0;
  #y: number = 0;

  #scale: number = 1;

  get scale() {
    return this.#scale;
  }

  set scale(v: number) {
    this.#performScale(v);
  }

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: flex;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;

        touch-action: none;
      }
    `;

    shadow.appendChild(style);

    const slot = document.createElement("slot");

    shadow.appendChild(slot);

    this.addEventListener("wheel", (ev) => {
      ev.preventDefault();

      // Ctrl が押されている場合はズーム
      if (ev.ctrlKey) {
        let { deltaY } = ev;

        // Firefox は挙動が違うため、値を他のプラットフォームと揃える
        if (ev.deltaMode === 1) {
          deltaY *= 15;
        }

        this.#performScale(this.#scale * (1 - deltaY / 100));

        this.#dispatchInputEvent();

        return;
      }

      // 押されていなければパン
      this.#x -= ev.deltaX;
      this.#y -= ev.deltaY;

      this.#dispatchInputEvent();
    });

    this.addEventListener("gesturestart", (ev) => {
      ev.preventDefault();

      this.#touch = {
        kind: TouchStateKind.Pinch,
        prevD: 0,
        startScale: this.#scale,
      };
    });

    this.addEventListener("gesturechange", (ev) => {
      const scale = (ev as any).scale;
      if (
        typeof scale !== "number" ||
        this.#touch.kind !== TouchStateKind.Pinch
      ) {
        return;
      }

      ev.preventDefault();

      this.#performScale(this.#touch.startScale * scale);

      this.#dispatchInputEvent();
    });

    this.addEventListener("gestureend", () => {
      this.#touch = { kind: TouchStateKind.Idle };
    });

    const onTouchCountChanged = (ev: TouchEvent) => {
      switch (ev.touches.length) {
        case 1: {
          const t = ev.touches.item(0)!;

          this.#touch = {
            kind: TouchStateKind.Pan,
            prevX: t.pageX,
            prevY: t.pageY,
          };
          return;
        }
        case 2: {
          const a = ev.touches.item(0)!;
          const b = ev.touches.item(1)!;

          this.#touch = {
            kind: TouchStateKind.Pinch,
            prevD: Math.sqrt(
              (a.pageX - b.pageX) ** 2 + (a.pageY - b.pageY) ** 2
            ),
            startScale: this.#scale,
          };
          return;
        }
        default: {
          this.#touch = { kind: TouchStateKind.Idle };
          return;
        }
      }
    };

    this.addEventListener("touchstart", onTouchCountChanged);

    this.addEventListener(
      "touchmove",
      (ev) => {
        switch (ev.touches.length) {
          case 1: {
            // パン
            if (this.#touch.kind !== TouchStateKind.Pan) {
              return;
            }

            const touch = ev.touches.item(0)!;
            const movementX = touch.pageX - this.#touch.prevX;
            const movementY = touch.pageY - this.#touch.prevY;

            this.#x += movementX;
            this.#y += movementY;

            this.#touch.prevX = touch.pageX;
            this.#touch.prevY = touch.pageY;

            this.#dispatchInputEvent();

            return;
          }
          case 2: {
            // ズーム
            if (this.#touch.kind !== TouchStateKind.Pinch) {
              return;
            }

            const a = ev.touches.item(0)!;
            const b = ev.touches.item(1)!;

            const d = Math.sqrt(
              (a.pageX - b.pageX) ** 2 + (a.pageY - b.pageY) ** 2
            );

            const factor = d / this.#touch.prevD;

            this.#performScale(this.#scale * factor);

            this.#touch.prevD = d;

            this.#dispatchInputEvent();

            return;
          }
          default: {
            return;
          }
        }
      },
      {
        passive: true,
      }
    );

    this.addEventListener("touchend", onTouchCountChanged);

    this.addEventListener("touchcancel", () => {
      this.#touch = { kind: TouchStateKind.Idle };
    });

    this.addEventListener("mousedown", (ev) => {
      ev.preventDefault();
    });

    this.addEventListener(
      "mousemove",
      (ev) => {
        if (ev.buttons === 0) {
          return;
        }

        this.#x += ev.movementX / this.#scale;
        this.#y += ev.movementY / this.#scale;

        this.#dispatchInputEvent();
      },
      {
        passive: true,
      }
    );
  }

  #performScale(factor: number) {
    const prevScale = this.#scale;

    this.#scale = Math.min(this.#scaleMax, Math.max(this.#scaleMin, factor));

    // 現在のビューポートの中心を起点に拡大するため、XYをその分だけずらす
    this.#x += (this.#x * this.#scale - this.#x * prevScale) / prevScale;
    this.#y += (this.#y * this.#scale - this.#y * prevScale) / prevScale;
  }

  #dispatchInputEvent() {
    this.dispatchEvent(
      new CustomEvent("viewport-input", {
        detail: {
          x: this.#x,
          y: this.#y,
          scale: this.#scale,
        },
      })
    );
  }

  resetScale() {
    this.#scale = 1;

    this.#dispatchInputEvent();
  }

  resetMovement() {
    this.#x = 0;
    this.#y = 0;

    this.#dispatchInputEvent();
  }

  reset() {
    this.#scale = 1;
    this.#x = 0;
    this.#y = 0;

    this.#dispatchInputEvent();
  }
}
