const path = require('path')
const Config = require('wtf-webpack-config')
const depExternals = require('./dep-externals')
const analyzer = require('./analyzer')
const pkg = require('../package.json')

module.exports = (env = {}) => {
  const PROD = env.production === true
  const mode = PROD ? 'production' : 'development'
  const PUBLIC_PATH = PROD ? '' : '/'
  const SRC_DIR = path.join(__dirname, '../main')
  const OUTPUT_DIR = path.join(__dirname, '..')
  const defaultInclude = [SRC_DIR]

  const config = new Config({
    optimization: {
      minimize: false,
    },
    devtool: env.debug ? 'eval' : 'source-map',
    mode,
    entry: {
      index: `${SRC_DIR}/index.js`,
      worker: `${SRC_DIR}/worker.js`,
    },
    output: {
      path: OUTPUT_DIR,
      filename: '[name].js',
      publicPath: PUBLIC_PATH,
    },
    target: 'electron-main',
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
        ],
      },
    })
    .use(analyzer, Boolean(env.report))

  return config.toConfig()
}
