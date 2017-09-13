const safeValue = (obj, path) =>
  path.reduce((s, p) => {
    if (!s || s === true) return undefined
    const v = s[p]
    if (v !== undefined) return v
    return undefined
  }, obj)

const watchState = (path, callback) => {
  let cache
  return (obj) => {
    const value = safeValue(obj, path)
    if (value !== undefined && cache !== value) {
      cache = value
      callback(value, obj)
    }
  }
}

export default watchState
