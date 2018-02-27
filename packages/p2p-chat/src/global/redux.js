import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware as createRouterMiddleware } from 'react-router-redux'
import createHistory from 'history/createHashHistory'
import rootReducer from './reducer'

const history = createHistory()
const RouterMiddleware = createRouterMiddleware(history)

const middlewares = [
  applyMiddleware(RouterMiddleware),
  process.env.NODE_ENV !== 'production' && require('./devToolsMiddleware').default,
].filter(Boolean)

const finalCreateStore = compose(...middlewares)(createStore)

const configureStore = initialState => {
  const store = finalCreateStore(rootReducer, initialState)

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./reducer', () => {
      store.replaceReducer(rootReducer)
    })
  }

  return store
}

export { history, configureStore }
