import React from 'react'
import ReactDOM from 'react-dom'
import App from '../layouts/App'

export default (store, history) => {
  ReactDOM.render(
    <App store={store} history={history} />,
    document.getElementById('root')
  )
}
