import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware as createRouterMiddleware } from 'react-router-redux'
import createHistory from 'history/createHashHistory'
import rootReducer from './reducers'

const history = createHistory()
const RouterMiddleware = createRouterMiddleware(history)

const middlewares = [applyMiddleware(RouterMiddleware)]

if (process.env.NODE_ENV !== 'production') {
  const DevTools = require('../layouts/DevTools').default // eslint-disable-line global-require
  middlewares.push(DevTools.instrument())
}

const finalCreateStore = compose(...middlewares)(createStore)

const configureStore = (initialState) => {
  const store = finalCreateStore(rootReducer, initialState)

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const nextReducer = require('./reducers').default // eslint-disable-line global-require
      store.replaceReducer(nextReducer)
    })
  }

  return store
}

export { history, configureStore }
