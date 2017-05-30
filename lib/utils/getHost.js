const net = require('net');
const getNewHost = require('./getNewHost');

const getHost = function getHost(port, host, callback) {
  const server = net.createServer();
  server.unref();
  server.once('error', () => {
    getHost(port, getNewHost(host), callback);
  });
  try {
    server.listen(port, host, () => {
      server.close(() => {
        callback(null, host);
      });
    });
  } catch (e) {
    getHost(port, getNewHost(host), callback);
  }
};

module.exports = getHost;
