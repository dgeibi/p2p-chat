const has = require('p2p-chat-utils/has')

const matchExternals = (req, dependencies) => {
  if (has(dependencies, req)) return true
  if (has(dependencies, req.split('/')[0])) return true
  return false
}

module.exports = dependencies => (context, request, callback) => {
  if (matchExternals(request, dependencies)) {
    callback(null, `commonjs ${request}`)
    return
  }
  callback()
}
