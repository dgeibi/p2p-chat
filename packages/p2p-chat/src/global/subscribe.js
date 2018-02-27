import subscribeDialog from '../components/Chatting/Dialog/subscribe'
import hot from '../utils/hot'

const subscribes = [subscribeDialog]

let replace
const makeReplace = (unsubscribe, store) => {
  replace = subscribe => {
    unsubscribe()
    replace = null
    subscribe(store)
  }
}

const subscribe = store => {
  const listener = () => {
    const state = store.getState()
    subscribes.forEach(x => x && x(state))
  }
  makeReplace(store.subscribe(listener), store)
}

hot({
  sourceModule: module,
  replaceGetter: () => replace,
  args: [subscribe],
})

export default subscribe
