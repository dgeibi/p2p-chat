const each = require('p2p-chat-utils/each')

module.exports = class Store {
  constructor() {
    this.store = {}
  }

  remove(key) {
    this.store[key] = undefined
  }

  add(key, value = true) {
    this.store[key] = value
  }

  has(key) {
    return Boolean(this.store[key])
  }

  get(key) {
    return this.store[key] || null
  }

  destory() {
    this.store = null
  }

  each(keys, callback) {
    each(this.store, keys, callback)
  }
}
