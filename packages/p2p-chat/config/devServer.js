const { spawn } = require('child_process')
const webpack = require('webpack')
const logger = require('p2p-chat-logger')

class StartElectron {
  apply(compiler) {
    compiler.plugin('done', () => {
      if (this.started) return
      this.started = true
      spawn('electron', ['.', '--devServer', '--port', compiler.options.devServer.port], {
        shell: true,
        env: process.env,
        stdio: 'inherit',
      })
        .on('close', () => process.exit(0))
        .on('error', spawnError => logger.error(spawnError))
    })
  }
}

module.exports = options => wtf => {
  wtf.plugin(webpack.HotModuleReplacementPlugin)
  wtf.plugin(StartElectron)
  // eslint-disable-next-line no-param-reassign
  wtf.config.devServer = Object.assign(
    wtf.config.devServer,
    {
      hot: true,
      stats: {
        colors: true,
        chunks: false,
        children: false,
      },
    },
    options
  )
}
