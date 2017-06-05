/* eslint-env browser */
/* eslint-disable no-console */

function bind(object, dataKey, defaultObject = {}, key) {
  let cache = null;
  const query = () => {
    if (cache === null) cache = document.querySelector(`[data-${dataKey}="${key}"]`);
    return cache;
  };

  Object.defineProperty(object, key, {
    get() {
      const node = query();
      if (!node) {
        console.log(`get ${dataKey}: ${key} fail`);
        return defaultObject[key];
      }
      const value = node[node.dataset.valueKey || 'value'] || defaultObject[key];
      if (node.dataset.type === 'number') return Number(value);
      return value;
    },
    set(value) {
      const node = query();
      if (node) node[node.dataset.valueKey || 'value'] = value;
      else console.log(`set ${dataKey}: ${key} fail`);
    },
  });
}

module.exports = bind;
