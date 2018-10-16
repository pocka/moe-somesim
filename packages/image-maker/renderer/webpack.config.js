const path = require('path')

const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin')

module.exports = {
  context: __dirname,
  target: 'electron-renderer',
  devtool: 'inline-source-map',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, './dest'),
    filename: 'main.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsConfigPathsPlugin()]
  },
  module: {
    rules: [
      {
        test: /\.tsx$/,
        loader: 'tsloader',
        options: {
          transpileOnly: true
        }
      }
    ]
  },
  plugins: [
    new ForkTsCheckerPlugin({
      tsconfig: '../tsconfig.json'
    })
  ]
}
