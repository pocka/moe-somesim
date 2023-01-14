import { MatchFrameSeeker } from "./match-frame-seeker";
import { SomesimGenerator } from "./somesim-generator";
import { VideoCropper } from "./video-cropper";
import { AppColorSwatch } from "../ui/app-color-swatch";
import { SomesimRenderer } from "../somesim-renderer";
import { Elm } from "../Helpers/Builder.elm";

if (!customElements.get("video-cropper")) {
  customElements.define("video-cropper", VideoCropper);
}

if (!customElements.get("match-frame-seeker")) {
  customElements.define("match-frame-seeker", MatchFrameSeeker);
}

if (!customElements.get("somesim-generator")) {
  customElements.define("somesim-generator", SomesimGenerator);
}

if (!customElements.get("somesim-renderer")) {
  customElements.define("somesim-renderer", SomesimRenderer);
}

if (!customElements.get("app-color-swatch")) {
  customElements.define("app-color-swatch", AppColorSwatch);
}

const app = Elm.Helpers.Builder.init();

app.ports.createObjectUrl.subscribe((file) => {
  const url = URL.createObjectURL(file);

  app.ports.receiveObjectUrl.send({ url, file });
});

app.ports.revokeObjectUrl.subscribe((url) => {
  URL.revokeObjectURL(url);
});
