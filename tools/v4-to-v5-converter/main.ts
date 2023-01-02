import { decode, encode } from "https://deno.land/x/pngs@0.1.1/mod.ts";

import * as flags from "../deps/flags.ts";
import { outdent } from "../deps/outdent.ts";

import { logger, verboseLogger } from "../log.ts";

/**
 * マスク画像をベース画像のアルファチャンネルに移行する
 */
function transferMaskToAlpha(
  base: Uint8Array,
  mask: Uint8Array,
  log: typeof logger,
): Uint8Array {
  const basePng = decode(base);

  log.debug(
    `ベース画像: ${basePng.width}x${basePng.height}, ${basePng.bitDepth}bit`,
  );

  const maskPng = decode(mask);

  log.debug(
    `マスク画像: ${maskPng.width}x${maskPng.height}, ${maskPng.bitDepth}bit`,
  );

  if (basePng.width !== maskPng.width || basePng.height !== maskPng.height) {
    const [bw, bh] = [basePng.width, basePng.height];
    const [mw, mh] = [maskPng.width, maskPng.height];

    throw new Error(
      `ベース画像とマスク画像のサイズが異なります: base=${bw}x${bh}, mask=${mw}x${mh}`,
    );
  }

  // 元画像に手を出さないようにクローンする
  const dest = basePng.image.slice();

  for (let i = 0, l = basePng.image.length; i < l; i += 4) {
    const maskR = maskPng.image[i];

    // ベース画像のRGBをそのまま使い、Aにはマスク画像のRを使う。
    // マスク画像は彩度0のためRだけを参照して問題ない。
    dest[i + 3] = maskR;
  }

  return encode(dest, basePng.width, basePng.height);
}

async function cli(): Promise<void> {
  const args = flags.parse(Deno.args, {
    string: ["base", "mask", "out"],
    boolean: ["help", "verbose"],
    alias: {
      verbose: "v",
      help: "?",
      base: "b",
      mask: "m",
      out: "o",
    },
  });

  if (args.help) {
    console.log(outdent`
    そめしむ画像フォーマット移行ツール

    [引数]
    -?, --help    ... このメッセージを表示する
    -b, --base    ... ベース画像のパス
    -m, --mask    ... マスク画像のパス
    -o, --out     ... 出力ファイル名 (パス)
    -v, --verbose ... デバッグログを出力する
  `);
    return;
  }

  const { base, mask, out, verbose } = args;

  const log = verbose ? verboseLogger : logger;

  if (!base) {
    throw new Error("ベース画像のパスは必須です");
  }

  if (!mask) {
    throw new Error("マスク画像のパスは必須です");
  }

  if (!out) {
    throw new Error("出力ファイル名を指定してください");
  }

  if (verbose) {
    log.debug(`ベース画像: ${base}`);
    log.debug(`マスク画像: ${mask}`);
    log.debug(`出力先: ${out}`);
  }

  log.info("ベース画像を読み込んでいます...");
  const baseFile = await Deno.readFile(base);

  log.info("マスク画像を読み込んでいます...");
  const maskFile = await Deno.readFile(mask);

  const output = transferMaskToAlpha(baseFile, maskFile, log);

  await Deno.writeFile(out, output);
}

if (import.meta.main) {
  cli().catch((err) => {
    logger.error(err.message);
    Deno.exit(1);
  });
}
