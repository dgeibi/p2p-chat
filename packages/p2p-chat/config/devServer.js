const { spawn } = require('child_process')
const webpack = require('webpack')
const logger = require('p2p-chat-logger')

module.exports = options => (config) => {
  config.plugin(new webpack.HotModuleReplacementPlugin())
  // eslint-disable-next-line no-param-reassign
  config.config.devServer = Object.assign(
    config.config.devServer,
    {
      hot: true,
      // hotOnly: true,
      stats: {
        colors: true,
        chunks: false,
        children: false,
      },
      before() {
        spawn('electron', ['.', '--devServer', '--port', config.config.devServer.port], {
          shell: true,
          env: process.env,
          stdio: 'inherit',
        })
          .on('close', () => process.exit(0))
          .on('error', spawnError => logger.error(spawnError))
      },
    },
    options
  )
}
