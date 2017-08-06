module.exports = function arr2keys(arr) {
  return arr.reduce((obj, key) => {
    obj[key] = 1 // eslint-disable-line no-param-reassign
    return obj
  }, {})
}
