const net = require('net');
const send = require('./send');

module.exports = function connect(connectOpts, message, callback) {
  const socket = net
    .connect(connectOpts, () => {
      send(socket, message);
      callback(null, socket);
    })
    .on('error', (e) => {
      callback(e);
    });
};
