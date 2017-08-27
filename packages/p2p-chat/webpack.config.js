const path = require('path')
const Config = require('wtf-webpack-config')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

const define = require('wtf-webpack-config/plugins/define')
const babel = require('wtf-webpack-config/rules/js/babel')
const babili = require('wtf-webpack-config/plugins/babili')
const devServer = require('./webpack-config/devServer')
const css = require('./webpack-config/css')
const pkg = require('./package.json')

module.exports = (env = {}) => {
  const isProduction = env.production === true

  const PUBLIC_PATH = isProduction ? `${pkg.output}/` : `/${pkg.output}/`
  const SRC_DIR = path.resolve(__dirname, 'src')
  const OUTPUT_DIR = path.resolve(__dirname, pkg.output)
  const defaultInclude = [SRC_DIR]

  const config = new Config({
    devtool: isProduction ? 'source-map' : 'cheap-module-eval-source-map',
    entry: { app: `${SRC_DIR}/index.js` },
    output: {
      path: OUTPUT_DIR,
      filename: '[name].bundle.js',
      publicPath: PUBLIC_PATH,
    },
    target: 'electron-renderer',
    node: {
      console: false,
      global: false,
      process: false,
      Buffer: false,
      __filename: false,
      __dirname: false,
      setImmediate: false,
    },
    externals: [],
  })
    .use(define(), isProduction)
    .use(devServer(), !isProduction)
    .use(babili(), isProduction)
    .use(
      babel({
        include: defaultInclude,
      })
    )
    .use(
      css({
        rule: {
          test: /\.less$/,
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: true,
              },
            },
            'less-loader',
          ],
        },
        extract: isProduction,
        extractOptions: 'antd.css',
      })
    )
    .use(
      css({
        rule: {
          test: /\.scss$/,
          include: defaultInclude,
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                localIdentName: '[path]___[name]__[local]___[hash:base64:5]',
                importLoaders: 1,
                minimize: true,
                sourceMap: true,
              },
            },
            { loader: 'postcss-loader', options: { sourceMap: true } },
          ],
        },
        extract: isProduction,
        extractOptions: 'main.css',
      })
    )
    .plugin(HtmlWebpackPlugin, [
      {
        title: pkg.name,
        template: 'src/index.ejs',
        filename: isProduction ? '../index.html' : 'index.html',
      },
    ])
    .plugin(webpack.NamedModulesPlugin, null, !isProduction)

  return config.toConfig()
}
