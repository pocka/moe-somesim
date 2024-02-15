import * as flags from "../deps/flags.ts";
import { outdent } from "../deps/outdent.ts";
import * as zod from "../deps/zod.ts";

import { logger, verboseLogger } from "../log.ts";

const itemSchema = zod.object({
  id: zod.string().startsWith("i_"),
  name: zod.string().trim().min(1),
  image: zod.string(),
});

type Item = zod.infer<typeof itemSchema>;

interface Group {
  id: string;
  name: string;
  expanded?: boolean;
  children: (Item | Group)[];
}

const groupSchema: zod.ZodType<Group> = zod.object({
  id: zod.string().startsWith("g_"),
  name: zod.string().trim().min(1),
  expanded: zod.boolean().optional(),
  children: zod.array(zod.lazy(() => zod.union([groupSchema, itemSchema]))),
});

type FlattenedTuple = [Item[], Omit<Group, "children">[]];

function flattenTree(tree: Group): FlattenedTuple {
  const [items, groups] = tree.children.map<FlattenedTuple>((child) => {
    if ("image" in child) {
      return [[child], []];
    }

    return flattenTree(child);
  }).reduce(
    (
      [items, groups],
      [xItems, xGroups],
    ) => [[...items, ...xItems], [...groups, ...xGroups]],
    [[], []],
  );

  const { children: _, ...withoutChildren } = tree;

  return [items, [withoutChildren, ...groups]];
}

/**
 * 重複要素を排除するための `Array.prototype.filter` に渡すコールバック
 */
function unique<T>(x: T, index: number, list: readonly T[]): boolean {
  return list.indexOf(x) === index;
}

async function main() {
  const args = flags.parse(Deno.args, {
    string: ["index"],
    boolean: ["help", "verbose"],
    alias: {
      verbose: "v",
      help: "?",
      index: "i",
    },
  });

  if (args.help) {
    console.log(outdent`
    そめしむ装備インデックスファイル検査ツール

    [引数]
    -?, --help    ... このメッセージを表示する
    -i, --index   ... インデックスファイルのパス
    -v, --verbose ... デバッグログを出力する
  `);
    return;
  }

  if (!args.index) {
    throw new Error("インデックスファイルのパスは必須です");
  }

  const log = args.verbose ? verboseLogger : logger;

  const cwd = new URL(Deno.cwd() + "/", import.meta.url);

  log.debug(`CWD: ${cwd.pathname}`);

  const indexJsonPath = new URL(args.index, cwd);

  log.debug(`インデックスファイル: ${indexJsonPath.pathname}`);

  const indexJson = await Deno.readTextFile(indexJsonPath).catch((err) => {
    log.error(`ファイルの読み込み\t\t...NG`);
    return Promise.reject(err);
  });

  log.info("ファイルの読み込み\t\t... OK");

  const result = groupSchema.safeParse(JSON.parse(indexJson));
  if (!result.success) {
    log.error(`ファイルの書式\t\t... NG`);
    throw result.error;
  }

  log.info("ファイルの書式\t\t... OK");

  const [items, groups] = flattenTree(result.data);

  log.debug(`グループ総数: ${groups.length}`);
  log.debug(`画像総数: ${items.length}`);

  // ID重複チェック
  log.debug("グループID重複チェック開始");

  const duplicatedGroups = groups.filter((group, i, list) =>
    list.findIndex((x) => x.id === group.id) !== i
  );
  if (duplicatedGroups.length > 0) {
    log.error(`グループID重複チェック\t... NG`);
    throw new Error(
      `重複しているグループIDが見つかりました: ${
        duplicatedGroups.map((g) => g.id).filter(unique).join(", ")
      }`,
    );
  }

  log.info(`グループID重複チェック\t... OK`);
  log.debug("画像ID重複チェック開始");

  const duplicatedItems = items.filter((item, i, list) =>
    list.findIndex((x) => x.id === item.id) !== i
  );
  if (duplicatedItems.length > 0) {
    log.error(`画像ID重複チェック\t\t... NG`);
    throw new Error(
      `重複している画像IDが見つかりました: ${
        duplicatedItems.map((i) => i.id).filter(unique).join(", ")
      }`,
    );
  }

  log.info(`画像ID重複チェック\t\t... OK`);

  const baseDir = new URL("./", indexJsonPath);

  log.debug(`ベースディレクトリ: ${baseDir.pathname}`);
  log.debug("画像ファイル存在チェック開始");

  await Promise.all(items.map(async (item) => {
    if (item.image.includes("\\")) {
      throw new Error(
        `ファイルパスには "\\" を含めることはできません: 区切り文字には "/" を利用してください (${item.image})`,
      );
    }

    const segments = item.image.split("/");
    if (segments.length === 0) {
      throw new Error(`ファイルパスが不正です: ${item.image}`);
    }

    const filename = segments[segments.length - 1];
    if (!/\.png$/.test(filename)) {
      throw new Error(
        `ファイルの拡張子は ".png" である必要があります (大文字は利用できません): ${item.image}`,
      );
    }

    const path = new URL(item.image, baseDir);

    if (!path.pathname.startsWith(baseDir.pathname)) {
      throw new Error(
        `画像ディレクトリ外にあるファイルは指定できません: ${item.image}`,
      );
    }

    const stat = await Deno.statSync(path);

    if (!stat.isFile) {
      throw new Error(`${item.image} はファイルではありません`);
    }

    if (stat.size === 0) {
      throw new Error(`${item.image} は空ファイルです`);
    }
  })).catch((err) => {
    log.error(`画像ファイル存在チェック\t... NG`);
    throw err;
  });

  log.info(`画像ファイル存在チェック\t... OK`);
}

if (import.meta.main) {
  main().catch((err) => {
    logger.error(err instanceof Error ? err.message : String(err));
    Deno.exit(1);
  });
}
