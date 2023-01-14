import { AppColorPicker } from "./ui/app-color-picker";
import { AppColorSwatch } from "./ui/app-color-swatch";
import { AppFlowerGroup } from "./ui/app-flower-group";
import {
  AppIconCollapse,
  AppIconFolder,
  AppIconFrasco,
  AppIconInfo,
  AppIconQuestion,
  AppIconShirt,
  AppIconZoomIn,
  AppIconZoomOut,
  AppIconZoomReset,
} from "./ui/app-icon";
import { AppLayout } from "./ui/app-layout";
import { AppPreview } from "./ui/app-preview";
import { AppTab, AppTabPanel, AppTabs } from "./ui/app-tab/mod";
import { AppTree, AppTreeGroup, AppTreeItem } from "./ui/app-tree";
import { AppStain } from "./ui/app-stain";
import { AppViewportControl } from "./ui/app-viewport-control";
import { SomesimRenderer } from "./somesim-renderer";
import { Elm } from "./Somesim/App.elm";

import "./styles";

const components: Record<string, typeof HTMLElement> = {
  "app-color-picker": AppColorPicker,
  "app-color-swatch": AppColorSwatch,
  "app-flower-group": AppFlowerGroup,
  "app-icon-collapse": AppIconCollapse,
  "app-icon-folder": AppIconFolder,
  "app-icon-frasco": AppIconFrasco,
  "app-icon-info": AppIconInfo,
  "app-icon-question": AppIconQuestion,
  "app-icon-shirt": AppIconShirt,
  "app-icon-zoom-in": AppIconZoomIn,
  "app-icon-zoom-out": AppIconZoomOut,
  "app-icon-zoom-reset": AppIconZoomReset,
  "app-layout": AppLayout,
  "app-preview": AppPreview,
  "app-tab": AppTab,
  "app-tab-panel": AppTabPanel,
  "app-tabs": AppTabs,
  "app-tree": AppTree,
  "app-tree-group": AppTreeGroup,
  "app-tree-item": AppTreeItem,
  "app-stain": AppStain,
  "app-viewport-control": AppViewportControl,
  "somesim-renderer": SomesimRenderer,
};

for (const [name, component] of Object.entries(components)) {
  if (!customElements.get(name)) {
    customElements.define(name, component);
  }
}

const app = Elm.Somesim.App.init({
  flags: {
    baseUrl: new URL(import.meta.env.BASE_URL, location.href).toString(),
    bugReportingUrl: __BUG_REPORT_URL__,
    repositoryUrl: __REPOSITORY_URL__,
    manualUrl: __MANUAL_URL__,
    authors: __AUTHORS__,
    version: __VERSION__,
  },
});

const onDialogClick = (ev: MouseEvent) => {
  if (ev.target !== ev.currentTarget) {
    return;
  }

  ev.target?.dispatchEvent(
    new CustomEvent("cancel", {
      bubbles: true,
      cancelable: true,
    })
  );
};

app.ports.elmToJsPort.subscribe((msg) => {
  switch (msg.type) {
    case "SendDialogImperativeClose": {
      const el = document.getElementById(msg.id);
      if (!el || !(el instanceof HTMLDialogElement)) {
        return;
      }

      el.removeEventListener("click", onDialogClick);
      el.close();

      return;
    }
    case "SendDialogImperativeOpen": {
      const el = document.getElementById(msg.id);
      if (!el || !(el instanceof HTMLDialogElement)) {
        return;
      }

      el.addEventListener("click", onDialogClick);
      el.showModal();

      return;
    }
    case "SendPreviewZoom": {
      const el = document.querySelector<AppViewportControl>(
        "app-viewport-control"
      );
      if (!el) {
        return;
      }

      el.scale += msg.zoom;
      el.resetMovement();

      return;
    }
    case "SendPreviewZoomReset": {
      const el = document.querySelector<AppViewportControl>(
        "app-viewport-control"
      );
      if (!el) {
        return;
      }

      el.reset();

      return;
    }
  }
});

window.addEventListener("dragover", (ev) => {
  ev.preventDefault();
});
