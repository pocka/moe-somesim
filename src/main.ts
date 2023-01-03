import { AppColorPicker } from "./ui/app-color-picker";
import { AppColorSwatch } from "./ui/app-color-swatch";
import { AppFlowerGroup } from "./ui/app-flower-group";
import { AppIconCollapse, AppIconFrasco, AppIconShirt } from "./ui/app-icon";
import { AppLayout } from "./ui/app-layout";
import { AppPreview } from "./ui/app-preview";
import { AppTab, AppTabPanel, AppTabs } from "./ui/app-tab/mod";
import { AppTree, AppTreeGroup, AppTreeItem } from "./ui/app-tree";
import { AppStain } from "./ui/app-stain";
import { SomesimRenderer } from "./somesim-renderer";
import { Elm } from "./Somesim/App.elm";

import "./styles";

const components: Record<string, typeof HTMLElement> = {
  "app-color-picker": AppColorPicker,
  "app-color-swatch": AppColorSwatch,
  "app-flower-group": AppFlowerGroup,
  "app-icon-collapse": AppIconCollapse,
  "app-icon-frasco": AppIconFrasco,
  "app-icon-shirt": AppIconShirt,
  "app-layout": AppLayout,
  "app-preview": AppPreview,
  "app-tab": AppTab,
  "app-tab-panel": AppTabPanel,
  "app-tabs": AppTabs,
  "app-tree": AppTree,
  "app-tree-group": AppTreeGroup,
  "app-tree-item": AppTreeItem,
  "app-stain": AppStain,
  "somesim-renderer": SomesimRenderer,
};

for (const [name, component] of Object.entries(components)) {
  if (!customElements.get(name)) {
    customElements.define(name, component);
  }
}

Elm.Somesim.App.init({
  flags: {
    baseUrl: new URL(import.meta.env.BASE_URL, location.href).toString(),
  },
});
