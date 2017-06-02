const net = require('net');

module.exports = function sendFile(data, options, callback) {
  const socket = net
    .connect(options, () => {
      socket.end(data);
      callback(null, socket);
    })
    .on('error', (e) => {
      callback(e);
    });
};
