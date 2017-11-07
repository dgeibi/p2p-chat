const net = require('net')
/* eslint-disable no-param-reassign, no-bitwise */
/* base-on get-port getport */

function getport(opts, callback) {
  if (!callback) throw TypeError('callback required')
  opts = opts || { start: 2000, end: 50000 }
  opts.start |= 0
  opts.end |= 0
  opts.start = opts.start < 2000 ? 2000 : opts.start
  opts.end = opts.end < 2000 ? 50000 : opts.end

  const { start, end } = opts

  if (start >= end) {
    callback(Error('out of ports'))
    return
  }

  const server = net.createServer()

  server.unref()
  server.on('error', () => {
    opts.start += 1
    getport(opts, callback)
  })

  server.listen(start, () => {
    if (server.address().port !== start) {
      opts.start += 1
      getport(opts, callback)
      server.close()
      return
    }
    server.close(() => {
      callback(null, start)
    })
  })
}

module.exports = getport
