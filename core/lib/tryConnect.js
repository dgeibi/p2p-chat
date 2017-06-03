const connect = require('./connect');
const logger = require('logger');

module.exports = function tryConnect(handler, message, connectOpts) {
  connect(connectOpts, message, (e, socket) => {
    if (!e) {
      handler(socket);
    } else {
      logger.warn(e.message);
    }
  });
};
