const REACT_HOT_LOADER = 'react-hot-loader/patch'

const addEntry = (obj, _key) => {
  const key = _key || 'entry'
  const entry = obj[key]
  if (Array.isArray(entry)) {
    if (entry[0] !== REACT_HOT_LOADER) {
      entry.unshift(REACT_HOT_LOADER)
    }
  } else if (typeof entry === 'string') {
    obj[key] = [REACT_HOT_LOADER, entry] // eslint-disable-line no-param-reassign
  }
}

const hmr = key => (conf) => {
  const { entry } = conf.config
  if (key && entry && typeof entry === 'object' && !Array.isArray(entry)) {
    addEntry(entry, key)
  } else {
    addEntry(conf.config)
  }
}

module.exports = hmr
