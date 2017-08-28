import React from 'react'
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import { ConnectedRouter as Router } from 'react-router-redux'
import Frame from './Frame'
import Chatting from '../views/Chatting'
import './global.scss'

function getDevTool() {
  if (process.env.NODE_ENV !== 'production') {
    const DevTools = require('./DevTools').default // eslint-disable-line global-require
    return <DevTools />
  }
  return null
}

const App = ({ store, history }) =>
  <Provider store={store}>
    <Frame>
      <Router history={history}>
        <Switch>
          <Route path="/chat/:type/:key" component={Chatting} />
        </Switch>
      </Router>
      {getDevTool()}
    </Frame>
  </Provider>

export default App
