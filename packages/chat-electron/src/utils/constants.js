export default (prefix, constants = []) =>
  constants.reduce((obj, key) => {
    obj[key] = `${prefix}/${key}` // eslint-disable-line no-param-reassign
    return obj
  }, {})
