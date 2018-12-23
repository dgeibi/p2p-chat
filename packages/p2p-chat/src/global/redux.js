import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware as createRouterMiddleware } from 'connected-react-router'
import createHistory from 'history/createHashHistory'
import makeReducer from './reducer'

const history = createHistory()
const RouterMiddleware = createRouterMiddleware(history)

const middlewares = [
  applyMiddleware(RouterMiddleware),
  process.env.NODE_ENV !== 'production' && require('./devToolsMiddleware').default,
].filter(Boolean)

const finalCreateStore = compose(...middlewares)(createStore)

const configureStore = initialState => {
  const store = finalCreateStore(makeReducer(history), initialState)

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./reducer', () => {
      store.replaceReducer(makeReducer(history))
    })
  }

  return store
}

export { history, configureStore }
