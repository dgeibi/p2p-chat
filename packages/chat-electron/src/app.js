import React from 'react'
import { render } from 'react-dom'
import { ipcRenderer } from 'electron'
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import { ConnectedRouter as Router } from 'react-router-redux'
import { store, history } from './redux'
import Frame from './layouts/Frame'
import { showError } from './utils/message'
import * as LoginActions from './components/Settings/LoginRedux'
import * as chatListActions from './components/Aside/ChatListRedux'
import Dialog from './components/Chatting/Dialog'

render(
  <Provider store={store}>
    <Frame>
      <Router history={history}>
        <Switch>
          <Route path="/dialog/:type/:key" component={Dialog} />
        </Switch>
      </Router>
    </Frame>
  </Provider>,
  document.querySelector('#root')
)

// global
ipcRenderer.on('logout-reply', (event, { errMsg }) => {
  if (errMsg) {
    showError(errMsg)
  }
})

ipcRenderer.on('setup-reply', (event, { errMsg, id }) => {
  if (!errMsg) {
    store.dispatch(LoginActions.updateSettings(id))
    store.dispatch(chatListActions.show())
  } else {
    showError(errMsg)
  }
})

ipcRenderer.on('before-setup', (event, { users, channels }) => {
  store.dispatch(chatListActions.setup({ users, channels }))
})

ipcRenderer.on('bg-err', (event, { errMsg }) => {
  showError(errMsg)
})

/*

// msg
ipcRenderer.on('text', (event, { tag, username, text, channel }) => {})

// file info
ipcRenderer.on('fileinfo', (event, { username, tag, filename, id, size }) => {})

// file:send
ipcRenderer.on('file-sent', (event, { tag, username, filename }) => {})
ipcRenderer.on('file-send-fail', (event, { tag, username, filename, errMsg }) => {})
ipcRenderer.on('file-unable-to-send', (event, { errMsg }) => {})

// file:receive
ipcRenderer.on('file-process-start', (event, { id }) => {})
ipcRenderer.on('file-processing', (event, { id, percent, speed }) => {})
ipcRenderer.on('file-process-done', (event, { id }) => {})
ipcRenderer.on('file-write-fail', (event, { tag, username, filename, id }) => {})
ipcRenderer.on('file-receiced', (event, { tag, username, filename, filepath, id }) => {})

*/
