/* eslint-disable no-param-reassign */
const Parse = require('./Parse')

const msgSocket = {
  send(msg) {
    this.write(`${JSON.stringify(msg)}\n`)
  },
}

const enhance = (opts) => {
  const { socket } = opts
  if (opts.parse) {
    const parse = new Parse(opts)
    socket.on('data', (chunk) => {
      parse.transform(chunk)
    })
  }
  Object.assign(socket, msgSocket)
  return socket
}

module.exports = enhance
