import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { routerReducer, routerMiddleware as createRouterMiddleware } from 'react-router-redux'
import createHistory from 'history/createHashHistory'
import rootReducer from './reducers'

const history = createHistory()

const RouterMiddleware = createRouterMiddleware(history)

const finalCreateStore = compose(
  applyMiddleware(RouterMiddleware),
  window && window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore)

const reducer = combineReducers({
  ...rootReducer,
  routing: routerReducer,
})

const store = finalCreateStore(reducer)

export { store, history }
