const nodeExternals = require('webpack-node-externals')

module.exports = (config) => {
  config.config.externals.push(
    nodeExternals({
      whitelist: ['webpack/hot/dev-server', 'webpack/hot/emitter'],
    })
  )
}
