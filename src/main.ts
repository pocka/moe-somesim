import { SomesimRenderer } from "./somesim-renderer";
import { Elm } from "./Somesim/App.elm";

if (!customElements.get("somesim-renderer")) {
  customElements.define("somesim-renderer", SomesimRenderer);
}

Elm.Somesim.App.init({});
