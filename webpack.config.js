const path = require('path');
const Config = require('wtf-webpack-config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const babel = require('wtf-webpack-config/rules/js/babel');
const devServer = require('./webpack-config/devServer');
const pkg = require('./package.json');

const PUBLIC_PATH = 'assets/';
const SRC_DIR = path.resolve(__dirname, 'app');
const OUTPUT_DIR = path.resolve(__dirname, PUBLIC_PATH);
const defaultInclude = [SRC_DIR];

module.exports = (env = {}) => {
  const isProduction = env.production === true;

  const config = new Config({
    entry: `${SRC_DIR}/index.js`,
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
    externals: [
      nodeExternals({
        whitelist: ['jquery', 'webpack/hot/dev-server', 'webpack/hot/emitter', /^lodash/],
      }),
    ],
  });

  config
    .use(devServer(), !isProduction)
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
    .plugin(HtmlWebpackPlugin, {
      title: pkg.name,
      template: 'app/index.ejs',
      filename: '../index.html',
    });

  return config.toConfig();
};
