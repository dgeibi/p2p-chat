const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = (config) => {
  config.plugin(BundleAnalyzerPlugin, [
    {
      analyzerMode: 'static',
    },
  ])
}
