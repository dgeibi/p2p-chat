const fs = require('fs-extra')
const ensureFilename = require('./ensure-unique-filename')

module.exports = pathname => {
  if (!pathname) throw Error('should pass a pathname')
  const path = ensureFilename(pathname)
  fs.ensureFileSync(path)
  return path
}
