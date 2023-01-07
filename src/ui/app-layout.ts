import css from "./app-layout.css?raw";

export class AppLayout extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    // CSS
    const style = document.createElement("style");

    style.textContent = css;

    shadowRoot.appendChild(style);

    // 情報パネル
    const infoPanel = document.createElement("div");
    infoPanel.classList.add("info-panel");
    infoPanel.innerHTML = `<slot name="info"></slot>`;

    shadowRoot.appendChild(infoPanel);

    // プレビュー
    const mainSlot = document.createElement("slot");

    shadowRoot.appendChild(mainSlot);

    // 装備パネル
    const shirtIcon = document.createElement("app-icon-shirt");
    shirtIcon.setAttribute("label", "装備");

    const itemPanel = createPanel({
      slotName: "item",
      additionalClassNames: ["item-panel"],
      defaultOpened: true,
      icon() {
        return shirtIcon;
      },
    });

    shadowRoot.appendChild(itemPanel);

    // 色パネル
    const frascoIcon = document.createElement("app-icon-frasco");
    frascoIcon.setAttribute("label", "染色液");

    const colorPanel = createPanel({
      slotName: "color",
      additionalClassNames: ["color-panel"],
      defaultOpened: true,
      icon() {
        return frascoIcon;
      },
    });

    shadowRoot.appendChild(colorPanel);

    // ポートレイト用タブ
    const tabs = document.createElement("div");
    tabs.classList.add("tab");

    const itemTab = document.createElement("button");
    itemTab.classList.add("tab--button", "tab--item");
    itemTab.appendChild(shirtIcon.cloneNode());
    itemTab.addEventListener("click", () => {
      itemPanel.setAttribute("data-opened", "");
      colorPanel.removeAttribute("data-opened");
    });

    const colorTab = document.createElement("button");
    colorTab.classList.add("tab--button", "tab--color");
    colorTab.appendChild(frascoIcon.cloneNode());
    colorTab.addEventListener("click", () => {
      itemPanel.removeAttribute("data-opened");
      colorPanel.setAttribute("data-opened", "");
    });

    tabs.appendChild(itemTab);
    tabs.appendChild(colorTab);
    shadowRoot.appendChild(tabs);
  }
}

interface CreatePanelParams {
  slotName: string;

  additionalClassNames?: readonly string[];

  defaultOpened?: boolean;

  icon(): HTMLElement;
}

function createPanel({
  slotName,
  icon,
  defaultOpened = false,
  additionalClassNames = [],
}: CreatePanelParams): HTMLDivElement {
  const panel = document.createElement("div");
  panel.classList.add("panel");

  for (const c of additionalClassNames) {
    panel.classList.add(c);
  }

  const header = document.createElement("button");
  header.classList.add("panel--header");

  const attrObserver = new MutationObserver((mutationList) => {
    for (const record of mutationList) {
      if (record.attributeName !== "data-opened") {
        continue;
      }

      if (panel.hasAttribute("data-opened")) {
        header.title = "パネルを閉じる";
      } else {
        header.title = "パネルを開く";
      }
    }
  });

  attrObserver.observe(panel, {
    attributes: true,
    attributeFilter: ["data-opened"],
  });

  // オブザーバで監視開始してから初期値を指定することでタイトル設定の二度手間を防いでいる
  if (defaultOpened) {
    panel.setAttribute("data-opened", "");
  }

  header.addEventListener("click", () => {
    if (panel.hasAttribute("data-opened")) {
      panel.removeAttribute("data-opened");
    } else {
      panel.setAttribute("data-opened", "");
    }
  });

  panel.appendChild(header);

  const arrowContainer = document.createElement("div");
  arrowContainer.classList.add("panel--header--arrow");

  const arrow = document.createElement("app-icon-collapse");

  arrowContainer.appendChild(arrow);
  header.appendChild(arrowContainer);

  const iconContainer = document.createElement("div");
  iconContainer.classList.add("panel--header--icon");

  iconContainer.appendChild(icon());
  header.appendChild(iconContainer);

  const body = document.createElement("div");
  body.classList.add("panel--body");

  panel.appendChild(body);

  const slot = document.createElement("slot");
  slot.name = slotName;

  body.appendChild(slot);

  return panel;
}
