function getParts(parts, zero = true) {
  const last = parts[parts.length - 1]
  if (last < 254) return [...parts.slice(0, parts.length - 1), last + 1]
  return [...getParts(parts.slice(0, parts.length - 1)), zero ? 0 : 1]
}

/**
 * get next IP address
 * @param {string} host
 * @returns {string}
 */
function getNewAddress(host) {
  const parts = host.split('.').map(Number)
  return getParts(parts, false).join('.')
}

module.exports = getNewAddress
