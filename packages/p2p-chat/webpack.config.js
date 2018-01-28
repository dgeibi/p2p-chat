const path = require('path')
const Config = require('wtf-webpack-config')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const Uglifyjs = require('uglifyjs-webpack-plugin')

const define = require('wtf-webpack-config/plugins/define')

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
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
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
    .plugin(
      Uglifyjs,
      [
        {
          parallel: true,
          uglifyOptions: {
            ie8: false,
            ecma: 8,
            output: {
              comments: false,
              beautify: false,
            },
            warnings: false,
          },
        },
      ],
      isProduction
    )
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
          test: /\.less$/,
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: true,
              },
            },
            {
              loader: 'less-loader',
              options: {
                modifyVars: {
                  'icon-url': '"../../../../../public/fonts/iconfont"',
                },
              },
            },
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
