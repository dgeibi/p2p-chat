module.exports = ({ rule, extract }) => config => {
  if (!rule || !rule.use) {
    throw Error('rule and rule.use required')
  }
  if (extract) {
    const MiniCssExtractPlugin = require('mini-css-extract-plugin') // eslint-disable-line global-require
    const use = [MiniCssExtractPlugin.loader, ...rule.use]
    config.rule(Object.assign({}, rule, { use }))
  } else {
    const use = ['style-loader', ...rule.use]
    config.rule(Object.assign({}, rule, { use }))
  }
}
