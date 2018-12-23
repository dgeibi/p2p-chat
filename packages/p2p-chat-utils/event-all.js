/**
 * @param {Array} meta
 */
module.exports = (meta, callback) => {
  const stats = meta.map(([emitter, name], index) => {
    emitter.once(name, () => {
      stats[index] = true
      if (stats.every(x => x)) {
        callback()
      }
    })

    return false
  })
}
