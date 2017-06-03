const getTag = require('./getTag');
const getPort = require('getport');
const ip = require('ip');

function login(opts, callback) {
  getPort(opts.port, (e, port) => {
    if (!e) {
      const id = Object.assign({}, opts);
      id.port = port;
      id.address = opts.host || ip.address(); // lan ip address
      id.tag = getTag(port, id.address, opts.username);
      callback(null, id);
    } else {
      callback(e);
    }
  });
}

module.exports = login;
