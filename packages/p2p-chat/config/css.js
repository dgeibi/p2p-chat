module.exports = ({ rule, extractOptions, extract }) => config => {
  if (!rule || !rule.use) {
    throw Error('rule and rule.use required')
  }
  if (extract && extractOptions) {
    const ExtractTextPlugin = require('extract-text-webpack-plugin') // eslint-disable-line global-require
    const extractor = new ExtractTextPlugin(extractOptions)
    const use = extractor.extract(rule.use)
    config.plugin(extractor)
    config.rule(Object.assign({}, rule, { use }))
  } else {
    const use = ['style-loader', ...rule.use]
    config.rule(Object.assign({}, rule, { use }))
  }
}
