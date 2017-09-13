import React from 'react'
import ReactDOM from 'react-dom'
import App from '../layouts/App'

const render = (ele) => {
  ReactDOM.render(ele, document.getElementById('root'))
}

export default (store, history) => {
  const Root = () => <App store={store} history={history} />

  if (module.hot) {
    // eslint-disable-next-line global-require
    const { AppContainer } = require('react-hot-loader')

    render(
      <AppContainer>
        <Root />
      </AppContainer>
    )

    module.hot.accept('../layouts/App', () => {
      render(
        <AppContainer>
          <Root />
        </AppContainer>
      )
    })
  } else {
    render(<Root />)
  }
}
