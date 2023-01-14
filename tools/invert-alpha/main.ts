// v5初期の a=0~255 -> m=0~1 形式の画像を、 a=1~255 -> m=1~0 形式にまとめて変換するスクリプト。
// `data/images` 配下の全てのPNG画像に適用して上書きを行うため、チェックインしていない変更がある場合は
// 実行しないこと。
import { decode, encode } from "https://deno.land/x/pngs@0.1.1/mod.ts";
import { walk } from "https://deno.land/std@0.172.0/fs/mod.ts";

const pngFilePattern = /\.png$/;

async function main() {
  const dir = Deno.args[0];
  if (!dir) {
    throw new Error("対象ディレクトリを指定してください");
  }

  for await (const entry of walk(dir)) {
    if (!entry.isFile || entry.isSymlink || !pngFilePattern.test(entry.name)) {
      continue;
    }

    const file = await Deno.readFile(entry.path);

    const decoded = decode(file);

    const dest = decoded.image.slice();

    for (let i = 0, l = dest.length; i < l; i += 4) {
      // スケール変換と反転を行う
      dest[i + 3] = ((255 - dest[i + 3]) / 255) * 254 + 1;
    }

    await Deno.writeFile(
      entry.path,
      encode(dest, decoded.width, decoded.height),
    );
  }
}

main().then(() => {
  Deno.exit(0);
}).catch((err) => {
  console.error(err);
  Deno.exit(1);
});
