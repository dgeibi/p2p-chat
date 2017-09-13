const getTag = require('./getTag')
const getPort = require('p2p-chat-utils/get-port')
const ip = require('ip')

/**
 * get tag, address, port
 * @param {{port: number, host: string, username: string}} opts
 * @param {function(?Error, ?{port: number, address: string, tag: string})} callback
 */
function login(opts, callback) {
  getPort({ start: opts.port }, (e, port) => {
    if (!e) {
      const id = Object.assign({}, opts)
      id.port = port
      id.address = opts.host || ip.address() // lan ip address
      id.tag = getTag(port, opts.username)
      callback(null, id)
    } else {
      callback(e)
    }
  })
}

module.exports = login
