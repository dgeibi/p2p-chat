const path = require('path')
const Config = require('wtf-webpack-config')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

const define = require('wtf-webpack-config/plugins/define')
const minify = require('wtf-webpack-config/plugins/babel-minify')

const devServer = require('./config/devServer')
const css = require('./config/css')
const reactHMR = require('./config/react-hmr')
const depExternals = require('./config/dep-externals')
const analyzer = require('./config/analyzer')
const generateScopedName = require('./config/generateScopedName')
const pkg = require('./package.json')

const getEnv = isDev => (isDev ? 'developement' : 'production')

const getLocalIdent = (context, localIdentName, localName) =>
  generateScopedName(localName, context.resourcePath)

module.exports = (env = {}) => {
  const isProduction = env.production === true
  const isDev = !isProduction

  const PUBLIC_PATH = isProduction ? '' : '/'
  const SRC_DIR = path.resolve(__dirname, 'src')
  const OUTPUT_DIR = path.resolve(__dirname, pkg.output)
  const defaultInclude = [SRC_DIR]

  process.env.BABEL_ENV = getEnv(isDev)

  const config = new Config({
    devtool: isProduction ? 'source-map' : 'cheap-module-eval-source-map',
    entry: {
      app: `${SRC_DIR}/index.js`,
      vendor: `${SRC_DIR}/vendor.js`,
    },
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
    externals: [depExternals(pkg.dependencies)],
  })
    .use(
      define({
        'process.env.NODE_ENV': JSON.stringify(getEnv(isDev)),
      })
    )
    .use(minify(), isProduction)
    .rule({
      test: /\.js$/,
      include: defaultInclude,
      loader: 'babel-loader',
      options: {
        plugins: [
          [
            'react-css-modules',
            {
              generateScopedName,
              webpackHotModuleReloading: isDev,
              filetypes: {
                '.scss': {
                  syntax: 'postcss-scss',
                  plugins: ['postcss-nested'],
                },
              },
            },
          ],
        ],
      },
    })
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
                getLocalIdent,
                modules: true,
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
        filename: 'index.html',
      },
    ])
    .plugin(webpack.NamedModulesPlugin, null, isDev)
    .use(reactHMR('app'), isDev)
    .use(
      devServer({
        contentBase: OUTPUT_DIR,
      }),
      isDev
    )
    .plugin(webpack.optimize.CommonsChunkPlugin, [
      {
        name: 'vendor',
        minChunks: Infinity,
      },
    ])
    .use(analyzer, Boolean(env.report))

  return config.toConfig()
}
