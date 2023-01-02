import css from "./app-color-swatch.css?raw";

export class AppColorSwatch extends HTMLElement {
  static get observedAttributes() {
    return ["value", "interactive"] as const;
  }

  attributeChangedCallback(
    name: typeof AppColorSwatch.observedAttributes[number],
    oldValue: string | null,
    newValue: string | null
  ) {
    if (oldValue === newValue) {
      return;
    }

    switch (name) {
      case "value": {
        this.#prevValue = oldValue;
        this.#value = newValue;
        this.#paint();
        return;
      }
      case "interactive": {
        this.#interactive = newValue !== null;
        this.#configureInteraction();
        return;
      }
    }
  }

  #container: HTMLDivElement = document.createElement("div");
  #fillLayer: HTMLDivElement = document.createElement("div");
  #borderLayer: HTMLDivElement = document.createElement("div");
  #dragGhost: HTMLDivElement = document.createElement("div");

  #prevValue: string | null = null;
  #value: string | null = null;
  #interactive: boolean = false;

  #animationQueue: null | [Animation, (() => Animation)[]] = null;

  get value() {
    return this.#value;
  }

  set value(v: string | null) {
    if (v === null) {
      this.removeAttribute("value");
    } else {
      this.setAttribute("value", v);
    }
  }

  get interactive() {
    return this.#interactive;
  }

  set interactive(v: boolean) {
    this.#interactive = v;

    if (v) {
      this.setAttribute("interactive", "");
    } else {
      this.removeAttribute("interactive");
    }
  }

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = css;

    shadow.appendChild(style);

    this.#dragGhost.classList.add("drag-ghost");

    this.#container.classList.add("container");
    this.#fillLayer.classList.add("fill");
    this.#borderLayer.classList.add("border");

    this.#container.appendChild(this.#fillLayer);
    this.#container.appendChild(this.#borderLayer);

    shadow.appendChild(this.#container);
    shadow.appendChild(this.#dragGhost);

    this.addEventListener("keypress", (ev) => {
      if (!this.#interactive) {
        return;
      }

      switch (ev.key) {
        case "Enter":
        case " ": {
          ev.preventDefault();
          ev.stopPropagation();

          this.dispatchEvent(new CustomEvent("click"));

          return;
        }
      }
    });

    // Safari 以外のブラウザが `setDragImage` をちゃんと実装していないため、
    // ゴースト用の要素を用意している。
    // - Firefox は CustomElements だとゴーストが表示されない
    // - Chrome は `overflow: hidden` でもはみ出した子要素の部分をビューポート計算に含める
    this.addEventListener("dragstart", (ev) => {
      if (!this.draggable || !ev.dataTransfer) {
        ev.preventDefault();
        ev.stopPropagation();
        return;
      }

      ev.dataTransfer.setDragImage(this.#dragGhost, 0, 0);
    });
  }

  connectedCallback() {
    const initialValue = this.getAttribute("value");

    this.#value = initialValue;

    this.#container.style.backgroundColor = initialValue || "transparent";

    this.#configureInteraction();
  }

  #dequeue() {
    if (!this.#animationQueue) {
      return;
    }

    const [, [f, ...rest]] = this.#animationQueue;
    if (!f) {
      this.#animationQueue = null;
      return;
    }

    const anim = f();
    anim.addEventListener("finish", () => {
      this.#dequeue();
    });

    this.#animationQueue = [anim, rest];
  }

  #enqueue(q: () => Animation) {
    if (!this.#animationQueue) {
      const anim = q();

      anim.addEventListener("finish", () => {
        this.#dequeue();
      });

      this.#animationQueue = [anim, []];
      return;
    }

    this.#animationQueue[1] = [...this.#animationQueue[1], q];
  }

  #paint() {
    if (!this.#value) {
      if (this.#animationQueue) {
        const [anim] = this.#animationQueue;

        anim.cancel();

        this.#animationQueue = null;
      }

      this.#dragGhost.style.backgroundColor = "transparent";
      this.#container.style.backgroundColor = "transparent";
      this.#fillLayer.style.backgroundColor = "transparent";
      return;
    }

    const prevValue = this.#prevValue;
    const value = this.#value;

    this.#enqueue(() => {
      this.#container.style.backgroundColor = prevValue || "transparent";
      this.#fillLayer.style.backgroundColor = value || "transparent";

      const anim = this.#fillLayer.animate(
        [{ transform: "scale(0)" }, { transform: "scale(1)" }],
        {
          duration: 300,
          easing: "ease-in",
        }
      );

      anim.addEventListener("finish", () => {
        this.#dragGhost.style.backgroundColor = value || "transparent";
      });

      return anim;
    });
  }

  #configureInteraction() {
    if (!this.#interactive) {
      this.tabIndex = -1;
      this.setAttribute("role", "presentation");
      return;
    }

    this.tabIndex = 0;
    this.setAttribute("role", "button");
  }
}
