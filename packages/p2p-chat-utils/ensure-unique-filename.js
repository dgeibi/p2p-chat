/* eslint-disable no-constant-condition, no-param-reassign */
const fs = require('fs')
const path = require('path')

/**
 * Get Unique filename that do not exist in disk
 * @return {string}
 * @param {string} filepath
 */
const ensureUnique = (filepath) => {
  do {
    if (fs.existsSync(filepath)) {
      const dirname = path.dirname(filepath)
      const basename = path.basename(filepath)

      const arr = basename.split('.')

      if (arr.length === 1) {
        arr.push(1)
      } else if (arr.length === 2) {
        const n = Number(arr[1])
        if (isNaN(n)) {
          arr.splice(1, 0, '1')
        } else {
          arr[1] = n + 1
        }
      } else {
        let idx = arr.length - 2
        let n = Number(arr[idx])
        if (!isNaN(n)) {
          arr[idx] = n + 1
        } else {
          idx += 1
          n = Number(arr[idx])
          if (!isNaN(n)) {
            arr[idx] = n + 1
          } else {
            arr.splice(arr.length - 1, 0, '1')
          }
        }
      }
      filepath = path.join(dirname, arr.join('.'))
    } else {
      break
    }
  } while (true)
  return filepath
}

module.exports = ensureUnique
