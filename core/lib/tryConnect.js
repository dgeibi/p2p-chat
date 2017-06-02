const connect = require('./connect');

module.exports = function tryConnect(handler, options) {
  connect(options, (e, socket) => {
    if (!e) {
      handler(socket);
    }
  });
};
