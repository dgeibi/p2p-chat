const fs = require('fs')

const ensureFilename = require('./ensure-unique-filename')

module.exports = (pathname) => {
  if (!pathname) throw Error('should pass a pathname')
  const path = ensureFilename(pathname)
  fs.closeSync(fs.openSync(path, 'w'))
  return path
}
