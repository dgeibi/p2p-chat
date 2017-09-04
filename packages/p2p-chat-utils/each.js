module.exports = function each(object, keys, callback) {
  if (typeof keys === 'function') {
    Object.keys(object).forEach((key) => {
      keys(object[key])
    })
  } else {
    keys.forEach((key) => {
      const value = object[key]
      if (value) {
        callback(value)
      }
    })
  }
}
