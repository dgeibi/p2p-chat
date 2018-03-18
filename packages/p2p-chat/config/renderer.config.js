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
  const isProduction = env.production === true
  const isDev = !isProduction

  const PUBLIC_PATH = isProduction ? '' : '/'
  const SRC_DIR = path.join(__dirname, '../src')
  const OUTPUT_DIR = path.join(__dirname, '../assets')
  const defaultInclude = [SRC_DIR]

  const config = new Config({
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
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
            '@babel/env',
            {
              targets: {
                electron: '1.8.0',
              },
              modules: false,
              useBuiltIns: 'usage',
              shippedProposals: true,
            },
          ],
          '@babel/react',
        ],
        plugins: [
          'transform-decorators-legacy',
          ['@babel/plugin-proposal-class-properties', { loose: true }],
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
          [
            'import',
            {
              libraryName: 'antd',
              style: true,
            },
          ],
          isDev && 'react-hot-loader/babel',
          isProduction && 'transform-react-remove-prop-types',
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
                  'icon-url': require('./fromAntdStyle')(
                    `${__dirname}/../public/fonts/iconfont`
                  ),
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
    .use(
      devServer({
        contentBase: OUTPUT_DIR,
      }),
      isDev
    )
    .use(analyzer, Boolean(env.report))

  return config.toConfig()
}
