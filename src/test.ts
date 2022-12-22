import { SomesimRenderer } from "./somesim-renderer";

import testImg from "../data/images/gacha-7/AbyssLinker_NF.png";
import kiranImg from "../data/images/gacha-9/Kiran_NF.png";
import abyssNMImg from "../data/images/gacha-7/AbyssLinker_NM.png";

customElements.define("somesim-renderer", SomesimRenderer);

const el = document.createElement("somesim-renderer");

document.body.appendChild(el);

const color: [number, number, number] = [0, 0, 0];

function applyColor() {
  const hex = (color[0] << 16) + (color[1] << 8) + color[2];
  el.setAttribute("color", ("000000" + hex.toString(16)).slice(-6));
}

applyColor();

function createSlider(label: string, type: "r" | "g" | "b") {
  const input = document.createElement("input");

  input.type = "range";
  input.min = "0";
  input.max = "255";
  input.value = "0";
  input.step = "1";
  input.id = type;

  input.addEventListener("input", (ev) => {
    const value = (ev.currentTarget as HTMLInputElement).value;

    const n = parseInt(value);
    if (!isFinite(n)) {
      return;
    }

    const index = type === "r" ? 0 : type === "g" ? 1 : 2;

    color[index] = n;
    applyColor();
  });

  const labelEl = document.createElement("label");

  labelEl.textContent = label;
  labelEl.setAttribute("for", type);

  document.body.appendChild(labelEl);
  document.body.appendChild(input);
}

createSlider("R", "r");
createSlider("G", "g");
createSlider("B", "b");

const cycleButton = document.createElement("button");

cycleButton.textContent = "Cycle";

let current = 0;
const images = [testImg, kiranImg, abyssNMImg];

cycleButton.addEventListener("click", () => {
  current += 1;
  if (current >= images.length) {
    current = 0;
  }

  el.setAttribute("src", images[current]!);
});

el.setAttribute("src", images[current]!);

document.body.appendChild(cycleButton);
