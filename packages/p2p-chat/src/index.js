import React from 'react'
import { render } from 'react-dom'
import { push } from 'react-router-redux'

import { configureStore, history } from './redux'
import App from './layouts/App'

const store = configureStore()
if (history.location.pathname !== '/') store.dispatch(push('/'))

if (!module.hot) {
  render(<App store={store} history={history} />, document.getElementById('root'))
} else {
  // eslint-disable-next-line global-require
  const { AppContainer } = require('react-hot-loader')

  const renderHot = (Root, hot = false) => {
    render(
      <AppContainer>
        <Root store={store} history={history} hot={hot} />
      </AppContainer>,
      document.getElementById('root')
    )
  }
  renderHot(App)

  module.hot.accept('./layouts/App', () => {
    renderHot(App, true)
  })
}
