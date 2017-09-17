import { push } from 'react-router-redux'

import { configureStore, history } from './global/redux'
import ipc from './global/ipc'
import render from './global/render'
import subscribe from './global/subscribe'

const store = configureStore()

render(store, history)
ipc(store.dispatch)
subscribe(store)

// redirect to root
if (history.location.pathname !== '/') store.dispatch(push('/'))
