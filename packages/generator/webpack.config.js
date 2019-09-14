// ---
// modules

const CleanPlugin = require('clean-webpack-plugin').CleanWebpackPlugin
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ScriptExtHtmlPlugin = require('script-ext-html-webpack-plugin')
const StyleExtHtmlPlugin = require('style-ext-html-webpack-plugin')
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const { EnvironmentPlugin } = require('webpack')

const pkg = require('./package.json')

// ---
// variables/constants

const gitRevision = new GitRevisionPlugin()
const VERSION = gitRevision.version()

// ---
// config

module.exports = (env, { mode }) => ({
  entry: {
    main: './src/index.tsx'
  },
  output: {
    filename: '[name].[hash:8].js',
    chunkFilename: 'chunk-[name].[hash:8].js',
    publicPath: process.env.PUBLIC_PATH || '/'
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            // 未定義のモジュールは全てこのフローの最後でキャッチされるため、
            // 処理させたくないファイルはここに指定しておく
            test: /\.(m?js|json|ejs|html)$/
          },
          // TypeScript
          {
            test: /\.tsx?$/,
            use: ['babel-loader']
          },
          // CSS
          {
            test: /\.css$/,
            oneOf: [
              // HTMLにインラインで埋め込む
              {
                resourceQuery: /inline/,
                use: [
                  {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                      hmr: mode === 'development'
                    }
                  },
                  'css-loader',
                  'postcss-loader'
                ]
              },
              // CSS Modules
              {
                resourceQuery: /module/,
                use: [
                  'style-loader',
                  {
                    loader: 'css-loader',
                    options: {
                      modules: true,
                      importLoaders: 1
                    }
                  },
                  'postcss-loader'
                ]
              },
              // その他
              {
                use: [
                  'style-loader',
                  'css-loader',
                  {
                    loader: 'postcss-loader',
                    options: {
                      config: {
                        path: __dirname
                      }
                    }
                  }
                ]
              }
            ]
          },
          // SVGアイコン(Reactコンポーネント)
          {
            test: /\.svg$/,
            resourceQuery: /component/,
            use: [
              'babel-loader',
              {
                loader: 'svg-react-loader',
                options: {
                  props: {
                    width: '1em',
                    height: '1em'
                  }
                }
              }
            ]
          },
          // その他ファイル
          {
            use: ['url-loader']
          }
        ]
      }
    ]
  },
  devtool: mode === 'development' && 'cheap-source-map',
  devServer: {
    port: 8080,
    watchContentBase: true,
    injectHot: true,
    quiet: true
  },
  resolve: {
    extensions: ['.js', '.jsx', '.mjs', '.ts', '.tsx'],
    plugins: [new TSConfigPathsPlugin()]
  },
  plugins: [
    new CleanPlugin(),
    new EnvironmentPlugin({
      NAME: pkg.name,
      VERSION
    }),
    new HtmlPlugin({
      template: './src/index.ejs'
    }),
    new ScriptExtHtmlPlugin({
      defaultAttribute: 'defer'
    }),
    new MiniCssExtractPlugin(),
    new StyleExtHtmlPlugin()
  ]
})
