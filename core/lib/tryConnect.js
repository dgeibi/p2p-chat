const connect = require('./connect');

module.exports = function tryConnect(handler, message, connectOpts) {
  connect(connectOpts, message, (e, socket) => {
    if (!e) {
      handler(socket);
    } else console.log(e);
  });
};
