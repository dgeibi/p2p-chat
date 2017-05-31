const getTag = require('./getTag');
// const getTypeError = require('./utils/getTypeError');
const getPort = require('getport');
const ip = require('ip');

function login(opts, callback) {
  getPort(opts.port, (e, port) => {
    if (!e) {
      const id = Object.assign({}, opts);
      id.port = port;
      id.address = ip.address(); // lan ip address
      id.tag = getTag(port, opts.host || id.address, opts.username);
      callback(null, id);
    } else {
      callback(e);
    }
  });
}

module.exports = login;
