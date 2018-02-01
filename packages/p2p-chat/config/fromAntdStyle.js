const from = require.resolve('antd/lib/style/index.less')
const { relative } = require('path')

module.exports = dir => relative(from, dir)
