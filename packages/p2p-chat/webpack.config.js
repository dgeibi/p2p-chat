module.exports = env => {
  const mode = env.production ? 'production' : 'developement'
  process.env.NODE_ENV = mode

  return [require('./config/renderer.config'), require('./config/main.config')].map(x => {
    if (typeof x === 'function') {
      x = x(env) // eslint-disable-line
    }
    x.mode = mode // eslint-disable-line
    return x
  })
}
