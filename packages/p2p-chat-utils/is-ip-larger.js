/**
 * compare IPs: check whether `a` is larger than `b`
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function isIPLarger(a, b) {
  const aParts = a.split('.').map(Number)
  const bParts = b.split('.').map(Number)
  return aParts.reduce((isLarger, num, index) => {
    if (isLarger) return true
    if (num > bParts[index]) return true
    return false
  }, false)
}

module.exports = isIPLarger
