import { push } from 'react-router-redux'

import { configureStore, history } from './redux'
import addIPCListeners from './global/addIPCListeners'
import render from './global/render'

const store = configureStore()

render(store, history)
addIPCListeners(store.dispatch)

// redirect to root
if (history.location.pathname !== '/') store.dispatch(push('/'))
