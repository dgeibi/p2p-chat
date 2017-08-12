const path = require('path')
const Config = require('wtf-webpack-config')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const babel = require('wtf-webpack-config/rules/js/babel')
const babili = require('wtf-webpack-config/plugins/babili')
const devServer = require('./webpack-config/devServer')
const nodeExternals = require('./webpack-config/nodeExternals')
const pkg = require('./package.json')

const PUBLIC_PATH = 'assets/'
const SRC_DIR = path.resolve(__dirname, 'src')
const OUTPUT_DIR = path.resolve(__dirname, PUBLIC_PATH)
const defaultInclude = [SRC_DIR]

module.exports = (env = {}) => {
  const isProduction = env.production === true

  const config = new Config({
    entry: `${SRC_DIR}/app.js`,
    output: {
      path: OUTPUT_DIR,
      filename: 'bundle.js',
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

  config
    .use(devServer(), !isProduction)
    .use(nodeExternals, !isProduction)
    .use(babili(), isProduction)
    .use(
      babel({
        include: defaultInclude,
      })
    )
    .rule({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
      include: defaultInclude,
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
