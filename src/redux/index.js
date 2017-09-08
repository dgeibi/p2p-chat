import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware as createRouterMiddleware } from 'react-router-redux'
import createHistory from 'history/createHashHistory'
import rootReducer from './reducer'

const history = createHistory()
const RouterMiddleware = createRouterMiddleware(history)

const middlewares = [applyMiddleware(RouterMiddleware)]

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  const DevTools = require('../layouts/DevTools').default
  middlewares.push(DevTools.instrument())
}

const finalCreateStore = compose(...middlewares)(createStore)

const configureStore = (initialState) => {
  const store = finalCreateStore(rootReducer, initialState)

  if (module.hot) {
    module.hot.accept('./reducer', () => {
      store.replaceReducer(rootReducer)
    })
  }

  return store
}

export { history, configureStore }
