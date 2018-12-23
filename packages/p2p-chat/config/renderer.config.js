const path = require('path')
const Config = require('wtf-webpack-config')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const devServer = require('./devServer')
const css = require('./css')
const depExternals = require('./dep-externals')
const analyzer = require('./analyzer')
const generateScopedName = require('./generateScopedName')
const pkg = require('../package.json')

const getLocalIdent = (context, localIdentName, localName) =>
  generateScopedName(localName, context.resourcePath)

module.exports = (env = {}) => {
  const SERVE = Boolean(env.serve)
  const PROD = env.production && !SERVE

  const PUBLIC_PATH = PROD ? '' : '/'
  const SRC_DIR = path.join(__dirname, '../src')
  const OUTPUT_DIR = path.join(__dirname, '../assets')
  const defaultInclude = [SRC_DIR]

  const config = new Config({
    mode: SERVE || !PROD ? 'development' : 'production',
    devtool: PROD ? '' : 'cheap-module-source-map',
    entry: {
      app: `${SRC_DIR}/index.js`,
    },
    output: {
      path: OUTPUT_DIR,
      filename: '[name].js',
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
    externals: [depExternals(pkg.dependencies)],
  })
    .rule({
      test: /\.js$/,
      include: defaultInclude,
      loader: 'babel-loader',
      options: {
        babelrc: false,
        presets: [
          [
            '@dgeibi/babel-preset-react-app',
            {
              targets: {
                electron: '4.0.0',
              },
              useBuiltIns: 'usage',
              shippedProposals: true,
            },
          ],
        ],
        plugins: [
          [
            'import',
            {
              libraryName: 'antd',
              libraryDirectory: 'es',
              style: 'css',
            },
            'antd-import',
          ],
          [
            'import',
            {
              libraryName: 'lodash',
              libraryDirectory: '',
              camel2DashComponentName: false,
            },
            'lodash-import',
          ],
          SERVE && 'react-hot-loader/babel',
        ].filter(Boolean),
      },
    })
    .rule({
      test: /\.(woff|woff2|eot|ttf|svg)(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
      },
    })
    .use(
      css({
        rule: {
          test: /\.css$/,
          use: [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                sourceMap: false,
              },
            },
            { loader: 'postcss-loader', options: { sourceMap: false } },
          ],
        },
        extract: PROD,
      })
    )
    .use(
      css({
        rule: {
          test: /\.scss$/,
          use: [
            {
              loader: 'css-loader',
              options: {
                getLocalIdent,
                modules: true,
                importLoaders: 1,
                sourceMap: false,
              },
            },
            { loader: 'postcss-loader', options: { sourceMap: false } },
          ],
        },
        extract: PROD,
      })
    )
    .plugin(HtmlWebpackPlugin, [
      {
        title: pkg.name,
        template: 'src/index.ejs',
        filename: 'index.html',
      },
    ])
    .use(
      devServer({
        contentBase: OUTPUT_DIR,
      }),
      SERVE
    )
    .use(analyzer, Boolean(env.report))
    .plugin(require('mini-css-extract-plugin'), [], PROD)

  return config.toConfig()
}
