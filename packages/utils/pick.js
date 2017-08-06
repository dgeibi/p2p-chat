/* eslint-disable no-param-reassign */

module.exports = function pick(object, props, keys) {
  if (!keys) keys = Object.keys(object)
  return keys.reduce((obj, key) => {
    const value = object[key]
    if (!value) return obj
    obj[key] = {}
    Object.keys(props).forEach((propKey) => {
      obj[key][propKey] = getValue(object[key], props[propKey])
    })
    return obj
  }, {})
}

function getValue(object, props) {
  if (!object) return null
  if (!Array.isArray(props)) return object[props]
  const [first, ...rest] = props
  if (!first) return object
  return getValue(object[first], rest)
}

// function pickKeyOnly(object, keys) {
//   if (!keys) keys = Object.keys(object)
//   return keys.reduce((obj, key) => {
//     const value = object[key]
//     if (!value) return obj
//     obj[key] = 1
//     return obj
//   }, {})
// }
