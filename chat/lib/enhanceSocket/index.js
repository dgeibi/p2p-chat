/* eslint-disable no-param-reassign */
// eslint-disable-next-line no-unused-vars
const { Socket } = require('net');

const Parse = require('./Parse');

const msgSocket = {
  send(msg) {
    this.write(`${JSON.stringify(msg)}\n`);
  },
};

const enhance = (opts) => {
  const socket = opts.socket;
  if (opts.parse) {
    const parse = new Parse(opts);
    socket.on('data', (chunk) => {
      parse.transform(chunk);
    });
  }
  Object.assign(socket, msgSocket);
  return socket;
};

module.exports = enhance;
