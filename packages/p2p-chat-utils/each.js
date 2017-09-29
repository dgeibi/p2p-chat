const fn = (object, callback) => (key) => {
  const value = object[key]
  if (value !== undefined) {
    callback(value)
  }
}

module.exports = function each(object, keys, callback) {
  if (!object || typeof object !== 'object') return

  if (typeof keys === 'function') {
    Object.keys(object).forEach(fn(object, keys))
  } else if (typeof callback === 'function' && Array.isArray(keys)) {
    keys.forEach(fn(object, callback))
  }
}
