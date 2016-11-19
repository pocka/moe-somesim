# MoEそめしむ

[MoEそめしむ](http://pocka.onl/app/moe/somesim/)


## これなに

スキル制MMORPG [Master Of Epic](http://moepic.com/)の装備染色シミュレータ


花びらを組み合わせて色を作ったり、色をパレットに保存したり、カラースライダーを操作して色を作ったり、たり、たり、たり...


このリポジトリはバグトラッキングのためっていうのと、ソースコード公開のため

## 使い方

1. 装備リストから装備を選んで
1. 色を作る
	1. 花びらリストから花びらを選んで
	1. 花びらスロット(四角の枠)にドラッグアンドドロップ


## プロジェクト構成

### 使用ツール

#### 共通

ビルド: Make

```bash
make
```

ファイル監視: [modd](https://github.com/cortesi/modd)

```bash
make watch
```

#### Javascript(Typescript)

+ [Typescript](https://github.com/Microsoft/TypeScript) - 型付のJavascriptメタ言語
+ [Redux](https://github.com/reactjs/redux) - Fluxライクフレームワーク
	- [redux-persist](https://github.com/rt2zz/redux-persist) - アプリケーションの状態を保存してくれる
	- [localforage](https://github.com/localForage/localForage) - Mozillaが作ったなんかすごいブラウザストレージの抽象化ライブラリ?
+ [deku](https://github.com/anthonyshort/deku) - Reactライクな仮想DOMライブラリ シンプルで速い
	- [deku-raf](https://github.com/pocka/deku-raf) - dekuのレンダリングに`requestAnimationFrame`を使うようにするやつ ないから作った
+ [browserify](https://github.com/substack/node-browserify) - フロントエンドを変えた魔法
	- [tsify](https://github.com/TypeStrong/tsify) - browserify + Typescript
+ [uglify-js](https://github.com/mishoo/UglifyJS2) - Javascriptを最小化してくれるやつ 機能たくさんあって他のやつよりいい

#### CSS(SASS)

+ [sassc](https://github.com/sass/sassc) - コマンドラインからSASSを直接コンパイルできるバイナリ(C言語製) めっちゃはやいからおすすめ
+ [postcss-cli](https://github.com/postcss/postcss-cli) - CSSに色々手を加えるpostcssのCLIインターフェイス
	- [autoprefixer](https://github.com/postcss/autoprefixer) - ブラウザのバージョンとか指定すると自動で必要なベンダープリフィックスつけてくれる
	- [cssnano](https://github.com/ben-eb/cssnano) - 結構積極的なCSS最小化ツール

#### HTML(Pug)

+ [pug-cli](https://github.com/pugjs/pug-cli) - pug(前はJadeって名前だった)のコンパイラ


## 注意

自分のサイトに組み込むことを前提とした作りのため、
そのままクローンして動かそうとしてもCSSの問題やマークアップの問題やCSSの問題でうまく動かないかもしれません

あと画像ファイルのパスや設定ファイルのパスも通さなきゃ多分動きません
