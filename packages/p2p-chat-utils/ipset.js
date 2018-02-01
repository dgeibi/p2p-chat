/**
 * IP-Port set
 */
function IPset(initalStore) {
  let store = initalStore || {}

  const self = {
    add,
    remove,
    has,
    reset,
    forEach,
    getStore,
    mergeStore,
    excludeStore,
  }

  /**
   * add address to ipset
   * @param {string} host
   * @param {number} port
   */
  function add(host, port) {
    if (typeof host !== 'string') throw TypeError('host should be a string')
    const portnum = Math.trunc(port)
    if (Number.isNaN(portnum)) {
      throw TypeError('port should be a integer')
    }
    if (store[host] === undefined) store[host] = {}
    store[host][portnum] = true
    return self
  }

  /**
   * remove address from ipset
   * @param {string} host
   * @param {number} port
   */
  function remove(host, port) {
    if (store[host] !== undefined) {
      store[host][port] = false
    }
    return self
  }

  /**
   * check whether has `host:port` in ipset
   * @param {string} host
   * @param {number} port
   */
  function has(host, port) {
    if (store[host] === undefined) return false
    if (store[host][port]) return true
    return false
  }

  /**
   * reset ipset
   */
  function reset(s) {
    store = s || {}
    return self
  }

  /**
   * invoke function with all addresses
   * @param {function(string, number)} fn
   */
  function forEach(fn) {
    Object.keys(store).forEach(host => {
      const portStore = store[host]
      Object.keys(portStore).forEach(portStr => {
        const port = +portStr
        const exists = portStore[portStr]
        if (exists) {
          fn(host, port)
        }
      })
    })
    return self
  }

  function getStore() {
    return store
  }

  function mergeStore(s) {
    const ipset = IPset(s)
    ipset.forEach((host, port) => {
      add(host, port)
    })
    return self
  }

  function excludeStore(s) {
    const ipset = IPset(s)
    ipset.forEach((host, port) => {
      if (has(host, port)) {
        remove(host, port)
      }
    })
    return self
  }

  return self
}

module.exports = IPset
