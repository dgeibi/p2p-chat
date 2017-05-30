const getTag = require('./getTag');
const getHost = require('./utils/getHost');
const getTypeError = require('./utils/getTypeError');

function login(opts, callback) {
  if (typeof opts.username !== 'string') callback(getTypeError('opts.username', 'string'));
  if (typeof opts.host !== 'string') callback(getTypeError('opts.host', 'string'));
  if (typeof opts.port !== 'number') callback(getTypeError('opts.port', 'number'));
  // 取得有效的 host:port
  getHost(opts.port, opts.host, (e, host) => {
    if (!e) {
      const id = Object.assign({}, opts);
      id.host = host;
      id.tag = getTag(opts.port, host, opts.username);
      callback(null, id);
    } else {
      callback(e);
    }
  });
}

module.exports = login;
