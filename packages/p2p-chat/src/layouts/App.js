import React from 'react'
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import { ConnectedRouter as Router } from 'react-router-redux'
import { store, history } from '../redux'
import Frame from './Frame'
import Chatting from '../views/Chatting'
import './global.scss'

const App = () =>
  <Provider store={store}>
    <Frame>
      <Router history={history}>
        <Switch>
          <Route path="/chat/:type/:key" component={Chatting} />
        </Switch>
      </Router>
    </Frame>
  </Provider>

export default App
