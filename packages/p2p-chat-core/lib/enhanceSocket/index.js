/* eslint-disable no-param-reassign */
const Parse = require('./Parse')

const msgSocket = {
  send(msg) {
    this.write(`${JSON.stringify(msg)}\n`)
  },
}

const enhance = opts => {
  const { socket, mixins } = opts
  if (opts.parse) {
    const parse = new Parse(opts)
    socket.on('data', chunk => {
      try {
        parse.transform(chunk)
      } catch (e) {
        parse.destory()
        socket.emit('error', e)
        socket.destory()
      }
    })
  }
  Object.assign(socket, msgSocket, mixins)
  return socket
}

module.exports = enhance
