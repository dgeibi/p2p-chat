/**
 * IP-Port set
 */
function IPset(initalStore) {
  let store = initalStore || {}

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
  }

  /**
   * remove address from ipset
   * @param {string} host
   * @param {number} port
   */
  function remove(host, port) {
    if (store[host] === undefined) return
    store[host][port] = false
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
  }

  /**
   * invoke function with all addresses
   * @param {function(string, number)} fn
   */
  function forEach(fn) {
    Object.keys(store).forEach((host) => {
      const portStore = store[host]
      Object.keys(portStore).forEach((portStr) => {
        const port = +portStr
        const exists = portStore[portStr]
        if (exists) {
          fn(host, port)
        }
      })
    })
  }

  function getStore() {
    return store
  }

  function mergeStore(s) {
    const ipset = IPset(s)
    ipset.forEach((host, port) => {
      add(host, port)
    })
  }

  function excludeStore(s) {
    const ipset = IPset(s)
    ipset.forEach((host, port) => {
      if (has(host, port)) {
        remove(host, port)
      }
    })
  }

  return {
    add,
    remove,
    has,
    reset,
    forEach,
    getStore,
    mergeStore,
    excludeStore,
  }
}

module.exports = IPset
