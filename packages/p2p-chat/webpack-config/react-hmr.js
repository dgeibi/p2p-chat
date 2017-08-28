const addEntry = (obj, key) => {
  const entry = obj[key || 'entry']
  if (Array.isArray(entry)) {
    if (entry[0] !== 'react-hot-loader/patch') entry.unshift('react-hot-loader/patch')
  } else if (typeof entry === 'string') {
    obj[key || 'entry'] = ['react-hot-loader/patch', entry] // eslint-disable-line no-param-reassign
  }
}

const hmr = (conf) => {
  const entry = conf.config.entry
  addEntry(conf.config)
  if (entry && typeof entry === 'object') {
    Object.keys(entry).forEach((key) => {
      addEntry(entry, key)
    })
  }
}

module.exports = hmr
