const hasOwn = Object.prototype.hasOwnProperty
const has = (obj, key) => hasOwn.call(obj, key)
module.exports = has
