const md5 = require('p2p-chat-utils/md5')
const { machineIdSync } = require('node-machine-id')

const machineId = machineIdSync({ original: true })

/**
 * Get tag according to port, host, username
 * @param {number} port
 * @param {string} username
 * @returns {string}
 */
module.exports = function getTag(port, username) {
  return md5.dataSync(machineId + port + username)
}
