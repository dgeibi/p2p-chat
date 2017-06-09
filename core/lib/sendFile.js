const net = require('net');
const jsonStream = require('./utils/jsonStream');

module.exports = function sendFile(data, options, callback) {
  const socket = net
    .connect(options, () => {
      const jsonSocket = jsonStream(socket);
      jsonSocket.end(data);
      callback(null, jsonSocket);
    })
    .on('error', (e) => {
      callback(e);
    });
};
