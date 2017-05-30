const net = require('net');
const send = require('./send');

module.exports = function connect(options, callback) {
  const socket = net.connect(options, () => {
    send(socket, {
      type: 'greeting',
      tag: options.tag,
      username: options.username,
    });
    callback(null, socket);
  }).on('error', (e) => {
    callback(e);
  });
};
