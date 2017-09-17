import subscribes from '../effects/subscribes'

export default (store) => {
  const listener = () => {
    const state = store.getState()
    subscribes.forEach(x => x && x(state))
  }

  let unsubscribe = store.subscribe(listener)

  if (module.hot) {
    module.hot.accept('../effects/subscribes', () => {
      unsubscribe()
      unsubscribe = store.subscribe(listener)
    })
  }
}
