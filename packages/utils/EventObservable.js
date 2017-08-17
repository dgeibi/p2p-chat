module.exports = (emitter) => {
  const observables = []
  return {
    observe(type, listener) {
      const destory = () => {
        emitter.removeListener(type, listener)
      }
      emitter.on(type, listener)
      observables.push(destory)
      return destory
    },
    removeAllObservables() {
      observables.forEach((x) => {
        x()
      })
      observables.splice(0)
    },
  }
}
