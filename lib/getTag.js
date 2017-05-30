const getChecksum = require('./utils/getChecksum');

module.exports = function getTag(port, host, username) {
  return getChecksum(host + port + username);
};
