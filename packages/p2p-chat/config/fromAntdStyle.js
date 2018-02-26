const from = require.resolve('antd/lib/style/index.less')
const { relative, normalize } = require('path')

module.exports = dir => relative(from, normalize(dir))
