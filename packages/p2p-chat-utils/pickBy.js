const pickBy = (src, testFn) =>
  Object.keys(src).reduce((o, k) => {
    if (testFn(src[k], k, src)) o[k] = src[k] // eslint-disable-line
    return o
  }, {})
module.exports = pickBy
