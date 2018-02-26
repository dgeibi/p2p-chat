module.exports = env =>
  [require('./config/renderer.config'), require('./config/main.config')].map(x => {
    if (typeof x === 'function') return x(env)
    return x
  })
