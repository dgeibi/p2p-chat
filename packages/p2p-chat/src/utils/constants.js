export default (constants = {}, prefix) => {
  Object.keys(constants).forEach(key => {
    constants[key] = `${prefix}/${key}` // eslint-disable-line
  })
}
