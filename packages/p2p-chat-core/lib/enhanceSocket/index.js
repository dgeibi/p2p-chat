/* eslint-disable no-param-reassign */
const Parse = require('./Parse')

const msgSocket = {
  send(msg) {
    this.write(`${JSON.stringify(msg)}\n`)
  },
}

const enhance = opts => {
  const { socket, mixins } = opts
  const parse = new Parse(opts)
  socket.on('data', chunk => {
    parse.transform(chunk)
  })
  const done = () => {
    parse.destory()
  }
  socket.on('close', done)
  socket.on('error', done)
  Object.assign(socket, msgSocket, mixins)
  return socket
}

module.exports = enhance
