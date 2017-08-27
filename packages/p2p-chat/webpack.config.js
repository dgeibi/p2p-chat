const path = require('path')
const Config = require('wtf-webpack-config')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const define = require('wtf-webpack-config/plugins/define')
const babel = require('wtf-webpack-config/rules/js/babel')
const babili = require('wtf-webpack-config/plugins/babili')
const devServer = require('./webpack-config/devServer')
const pkg = require('./package.json')

const PUBLIC_PATH = 'assets/'
const SRC_DIR = path.resolve(__dirname, 'src')
const OUTPUT_DIR = path.resolve(__dirname, PUBLIC_PATH)
const defaultInclude = [SRC_DIR]

module.exports = (env = {}) => {
  const isProduction = env.production === true

  const config = new Config({
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
    .rule({
      test: /\.scss$/,
      include: defaultInclude,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: true,
            localIdentName: '[path]___[name]__[local]___[hash:base64:5]',
            importLoaders: 1,
            minimize: true,
          },
        },
        'postcss-loader',
      ],
    })
    .rule({
      test: /\.less$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            minimize: true,
          },
        },
        'less-loader',
      ],
    })
    .plugin(HtmlWebpackPlugin, [
      {
        title: pkg.name,
        template: 'src/index.ejs',
        filename: '../index.html',
      },
    ])

  return config.toConfig()
}
