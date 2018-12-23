import React from 'react'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'
import { Row, Col } from 'antd'
import { Route } from 'react-router-dom'
import { ConnectedRouter as Router } from 'connected-react-router'
import { hot } from 'react-hot-loader'

import SettingNav from '../views/Settings'
import Aside from '../views/Aside'
import Chatting from '../views/Chatting'
import styles from './global.scss'

function getDevTool() {
  if (process.env.NODE_ENV !== 'production') {
    const DevTools = require('./DevTools').default
    return <DevTools />
  }
  return null
}

const App = ({ store, history }) => (
  <Provider store={store}>
    <Router history={history}>
      <Row>
        <Col span={6} className={`${styles.col} ${styles['col-1']}`}>
          <SettingNav />
          <Aside />
        </Col>
        <Col span={18} className={styles.col}>
          <Route
            path="/chat/:type/:key"
            render={({ component: Component, ...rest }) => <Chatting {...rest} />}
          />
          {getDevTool()}
        </Col>
      </Row>
    </Router>
  </Provider>
)

App.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
}

export default hot(module)(App)
