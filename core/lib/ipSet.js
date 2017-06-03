function ipSet() {
  let store = {};

  function add(host, port) {
    if (typeof host !== 'string') throw TypeError('host should be a string');
    const portnum = parseInt(port, 10);
    if (isNaN(portnum)) {
      throw TypeError('port should be a integer');
    }
    if (store[host] === undefined) store[host] = {};
    store[host][portnum] = true;
  }

  function remove(host, port) {
    if (store[host] === undefined) return;
    store[host][port] = false;
  }

  function has(host, port) {
    if (store[host] === undefined) return false;
    if (store[host][port]) return true;
    return false;
  }

  function reset() {
    store = {};
  }

  function forEach(fn) {
    Object.keys(store).forEach((host) => {
      const portStore = store[host];
      Object.keys(portStore).forEach((portStr) => {
        const port = +portStr;
        const exists = portStore[portStr];
        if (exists) {
          fn(host, port);
        }
      });
    });
  }

  return {
    add,
    remove,
    has,
    reset,
    forEach,
  };
}

// const ips = ipSet();
// ips.add('sss', 1111);
// ips.add('sss', 1111);
// ips.add('ssx', 1111);
// ips.forEach((host, port) => {
//   console.log(host, port);
// });

module.exports = ipSet;
