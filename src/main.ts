import { AppBreadcrumbs } from "./ui/app-breadcrumbs";
import { AppFlowerGroup } from "./ui/app-flower-group";
import { AppFlowerColor } from "./ui/app-flower-color";
import { AppItemList } from "./ui/app-item-list";
import { AppItemListGroup } from "./ui/app-item-list-group";
import { AppItemListItem } from "./ui/app-item-list-item";
import { AppLayout } from "./ui/app-layout";
import { AppPreview } from "./ui/app-preview";
import { AppStain } from "./ui/app-stain";
import { SomesimRenderer } from "./somesim-renderer";
import { Elm } from "./Somesim/App.elm";

import "./styles";

const components: Record<string, typeof HTMLElement> = {
  "app-breadcrumbs": AppBreadcrumbs,
  "app-flower-color": AppFlowerColor,
  "app-flower-group": AppFlowerGroup,
  "app-item-list": AppItemList,
  "app-item-list-group": AppItemListGroup,
  "app-item-list-item": AppItemListItem,
  "app-layout": AppLayout,
  "app-preview": AppPreview,
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
