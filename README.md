# MoEそめしむ

[MoEそめしむ](http://pocka.onl/app/moe/somesim/)


## これなに

スキル制MMORPG [Master Of Epic](http://moepic.com/)の装備染色シミュレータ


花びらを組み合わせて色を作ったり、色をパレットに保存したり、カラースライダーを操作して色を作ったり、たり、たり、たり...


このリポジトリはバグトラッキングのためっていうのと、ソースコード公開のため(あと説明とかアップデートログとか)

## 使い方

1. 左側(モバイルでは上)にある装備リストから染めたい装備を選びます
1. 右側(モバイルでは下)の色管理パネル上で色を作って装備を染色します
	1. `花びら`タブでは、花びらを上(モバイルでは左)にあるスロット(四角枠)にドラッグ&ドロップして染色液を作成することができます
	1. `パレット`タブでは、気に入った色を保存したり、その色を読みこんだりすることができます
		+ 右上の`+`ボタンを押すと、現在の染め色を保存することができます
		+ 名前の編集も可能です
		+ 現在の染め色で上書きしたい場合は保存アイコンのボタンを押して下さい
		+ 色を読み出したい場合は色をタップまたはクリックして下さい
	1. (PC版のみ)色プレビューの右にあるカラースライダーを操作して好きな色を作成することができます

## 動作環境

最新から2世代前までのモダンブラウザ(Firefox,Chrome,Safari,Chromiume系ブラウザ等)が動作環境です。

## 使用上の注意

+ 染色結果の誤差は殆どありませんが、あくまで染色をする際の参考程度に使用して下さい
+ キャラクター選択画面の画像を使用しているため、ゲーム内での色、つまりゲーム内光源にあたった色とは差が生じます
+ 内部数値をRGBで管理しています
	- 染色液の数値(%表示)と少しの誤差が生じますが、これについては仕様です

## 参考サイト

+ 調合計算式
	+ [超でこっぱち](http://chou.deko8.jp/)様

## その他
+ 装備の性能が知りたい場合は[装備DB](http://pocka.onl/app/moe/db/)をご利用ください
+ 装備画像の追加更新状況は[#MoEそめしむ](https://twitter.com/search?q=%23MoE%E3%81%9D%E3%82%81%E3%81%97%E3%82%80&src=hash&f=tweets)でツイートしてます。
+ 種族別、部位別の装備画像は一部[MoE装備画像](http://pocka.onl/article/moe/)に掲載しています。

## アプリで使用している画像について
(C)Willoo Entertainment Inc. (C)Konami Digital Entertainment 株式会社ウィローエンターテイメント及び株式会社コナミデジタルエンタテインメントの著作権を侵害する行為は禁止されています。


## アプリ本体について

License: MIT (See `LICENSE`)


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


## リポジトリについての注意

自分のサイトに組み込むことを前提とした作りのため、
そのままクローンして動かそうとしてもCSSの問題やマークアップの問題やCSSの問題でうまく動かないかもしれません

あと画像ファイルのパスや設定ファイルのパスも通さなきゃ多分動きません
