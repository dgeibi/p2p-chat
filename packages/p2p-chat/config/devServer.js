const { spawn } = require('child_process')
const webpack = require('webpack')
const logger = require('p2p-chat-logger')

class StartElectron {
  apply(compiler) {
    compiler.hooks.done.tap('selfdone', () => {
      if (this.started) return
      this.started = true
      spawn('electron .', {
        shell: true,
        env: Object.assign(
          {
            DEV_PORT: compiler.options.devServer.port,
          },
          process.env
        ),
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
      disableHostCheck: true,
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
