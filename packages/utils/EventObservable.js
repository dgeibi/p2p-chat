module.exports = emitter => (type, listener) => {
  emitter.on(type, listener)
  return () => {
    emitter.removeListener(type, listener)
  }
}
