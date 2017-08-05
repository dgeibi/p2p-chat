const md5 = require('./utils/md5')

/**
 * Get tag according to port, host, username
 * @param {number} port
 * @param {string} host - IP address
 * @param {string} username
 * @returns {string}
 */
module.exports = function getTag(port, host, username) {
  return md5.dataSync(host + port + username)
}
