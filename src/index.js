import { push } from 'react-router-redux'
import throttle from 'lodash.throttle'

import { configureStore, history } from './redux'
import addIPCListeners from './global/addIPCListeners'
import render from './global/render'
import watchState from './utils/watchState'
import storage from './utils/storage'

const store = configureStore()

render(store, history)
addIPCListeners(store.dispatch)

{
  // storage chat history
  const handleDialogChange = watchState(
    ['chatting', 'dialog'],
    throttle(
      (dialog, state) => {
        if (state.settings.login.logined) {
          const key = `dialog-${state.settings.login.tag}`
          storage.set(key, dialog)
        }
      },
      200,
      { leading: true }
    )
  )

  store.subscribe(() => {
    const state = store.getState()
    handleDialogChange(state)
  })
}

// redirect to root
if (history.location.pathname !== '/') store.dispatch(push('/'))
