import { Elm } from "../Helpers/ImageConcat.elm";

import "../styles";

async function main() {
  const app = Elm.Helpers.ImageConcat.init();

  const canvas = document.getElementById("canvas") as HTMLCanvasElement;

  app.ports.sendFreeImage.subscribe((img: HTMLImageElement) => {
    try {
      URL.revokeObjectURL(img.src);
    } catch (err) {
      console.warn("リソース解放に失敗");
      console.warn(err);
    }
  });

  app.ports.sendImageCreationRequest.subscribe((file: File) => {
    const url = URL.createObjectURL(file);

    const image = document.createElement("img");

    image.addEventListener("load", () => {
      app.ports.recieveCreatedImage.send({ file, image });
    });

    image.src = url;
  });

  app.ports.sendRenderingRequest.subscribe(
    (images: readonly HTMLImageElement[]) => {
      const ctx = canvas.getContext("2d")!;

      if (!images.length) {
        canvas.width = 0;
        canvas.height = 0;
        return;
      }

      const minHeight = Math.min(...images.map((img) => img.height));

      const totalWidth = images.reduce(
        (a, b) => a + b.width * (minHeight / b.height),
        0
      );

      canvas.width = totalWidth;
      canvas.height = minHeight;

      ctx.clearRect(0, 0, totalWidth, minHeight);

      let px: number = 0;

      for (const image of images) {
        const width = image.width * (minHeight / image.height);

        ctx.drawImage(image, px, 0, width, minHeight);

        px += width;
      }
    }
  );
}

main();
