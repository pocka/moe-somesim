# コントリビュートに関する諸々

## 装備画像を追加したい！

デフォルトの画像セットに追加したい場合は、 `data/images` 内に画像を追加してから `data/images/index.json` にアイテム情報を追加してください。画像は既存のディレクトリ構成に合わせて適切な場所に追加してください。

```ts
{
  // グループ、そめしむ上でフォルダとして機能する部分のIDは必ず `g_` から始まる必要があります
  // 重複を防ぐために `g_装備名英語` としましょう
  "id": "g_abysslinker",
  // `name` の中身はそめしむ上でフォルダ名として表示されます
  // できるだけ公式の名称を利用しましょう
  "name": "アビスリンカー装備",
  // デフォルトでフォルダを開いた状態にする場合は `expanded` に `true` を指定します
  // しない場合は `expanded` のプロパティ自体不要です (ここではサンプルとして記載しています)
  "expanded": false,
  "children": [
    // 種族やアングル、部位などで装備セット内に複数の画像があることがほとんどだと思うので、
    // 装備セットのグループを使ってからそれぞれ画像を登録してください
    {
      // 画像のIDは必ず `i_` から始まる必要があります
      // 重複を防ぐために `i_装備名英語_種族や部位など` としましょう
      "id": "i_abysslinker_nf",
      // 表示されるテキストです
      // できるだけ画像を簡潔に説明するわかりやすい名前にしましょう
      "name": "ニューター女",
      // 画像へのパスです
      // `data/images` から解決されるため、この例の場合は
      // `data/images/gacha-7/AbyssLinker_NF.png` として画像を追加する必要があります
      "image": "gacha-7/AbyssLinker_NF.png"
    }
  ]
}
```

## 装備画像はどうやって作成すればいいの？

> 準備中...

## 画像セットを作るにはどうすればいい？

> 準備中...

## アプリケーションを開発するにあたって

### 必須ツールの準備

#### asdf を使う (推奨)

[asdf](https://github.com/asdf-vm/asdf) を利用することで開発環境を簡単にセットアップすることができます。

まずは必要なプラグインがインストールされていることを確認してください。

- Node.js: <https://github.com/asdf-vm/asdf-nodejs/>
- Deno: <https://github.com/asdf-community/asdf-deno>
- Elm: <https://github.com/asdf-community/asdf-elm>

プラグインがインストールできたらリポジトリルートで以下のコマンドを実行してください。

```sh
$ asdf install
```

#### 手動で準備する

以下のランタイムが利用できる必要があります。

- Node.js v18.6
- Elm v0.19.1
- Deno v1.29

### 開発サーバの起動

```sh
npm run dev

# ポートを指定する
npm run dev -- --port 3000
```

## フォークする場合

フォークして別にホスティングする場合の手順です。

フォークしたらまずは `src/index.html` 内の OGP タグのハードコーディングされた URL (`https://pocka.github.io/moe-somesim/`) を自分の環境の URL に書き換えてください。
もしもホストするルートのパスが変わる場合は `.github/workflows/deploy.yml` 内でビルドコマンドに渡しているパスプリフィックスも変更してください。

次に `package.json` ファイルを開いて以下のプロパティを変更します:

- `bugs.url` をクローンしたリポジトリのバグ報告 URL に変更
- `repository.url` をクローンしたリポジトリの URL に変更
- `contributors` に自分の情報を追加
- `config.manual.url` をクローンしたリポジトリ内の `docs/MANUAL.md` への URL に変更
