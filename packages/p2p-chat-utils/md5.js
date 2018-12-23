const fs = require('fs')
const crypto = require('crypto')

/**
 * Get md5sum of file
 * @param {string} filepath full path of file
 * @param {boolean} strict whether check `file` is a file
 * @param {function(?Error, string)} callback
 */
const file = (filepath, strict, callback) => {
  if (strict) {
    let stats
    try {
      stats = fs.statSync(filepath)
    } catch (err) {
      callback(err)
      return
    }
    if (!stats.isFile()) {
      callback(Error(`${filepath} is not a file`))
      return
    }
  }

  fs.createReadStream(filepath)
    .pipe(crypto.createHash('md5').setEncoding('hex'))
    .on('finish', function finished() {
      callback(null, this.read())
    })
}

/**
 * Get md5 checksum of data
 * @param {(string|Buffer)} data
 * @returns {string}
 */
const dataSync = data =>
  crypto
    .createHash('md5')
    .update(data)
    .digest('hex')

module.exports = {
  dataSync,
  file,
}
