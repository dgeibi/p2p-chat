import React from 'react'
import { render } from 'react-dom'
import { ipcRenderer } from 'electron'
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import { ConnectedRouter as Router } from 'react-router-redux'
import { store, history } from './redux'
import Frame from './layouts/Frame'
import { showError } from './utils/message'
import { loginActions } from './views/SettingsRedux'
import { chatListActions } from './views/AsideRedux'
import Chatting from './views/Chatting'
import { dialogActions, filePanelActions } from './views/ChattingRedux'

render(
  <Provider store={store}>
    <Frame>
      <Router history={history}>
        <Switch>
          <Route path="/chat/:type/:key" component={Chatting} />
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
    store.dispatch(loginActions.updateSettings(id))
    store.dispatch(chatListActions.show())
  } else {
    showError(errMsg)
  }
})

ipcRenderer.on('bg-err', (event, { errMsg }) => {
  showError(errMsg)
})

ipcRenderer.on('text', (event, { tag, username, text, channel }) => {
  store.dispatch(dialogActions.newMessage({ tag, username, text, channel }))
})

/* file receive */
ipcRenderer.on('fileinfo', (event, { username, tag, filename, id, size }) => {
  store.dispatch(filePanelActions.fileCome({ username, tag, filename, id, size }))
})

ipcRenderer.on('file-process-start', (event, message) => {
  store.dispatch(filePanelActions.fileCome(message))
})

ipcRenderer.on('file-processing', (event, message) => {
  store.dispatch(filePanelActions.fileProcessing(message))
})

ipcRenderer.on('file-process-done', (event, message) => {
  store.dispatch(filePanelActions.fileEnd(message))
})

ipcRenderer.on('file-receive-fail', (event, message) => {
  store.dispatch(filePanelActions.fileReceiveError(message))
})

ipcRenderer.on('file-receiced', (event, message) => {
  store.dispatch(filePanelActions.fileReceived(message))
})

/*
// msg
// file info
ipcRenderer.on('fileinfo', (event, { username, tag, filename, id, size }) => {})

// file:send
ipcRenderer.on('file-sent', (event, { tag, username, filename }) => {})
ipcRenderer.on('file-send-fail', (event, { tag, username, filename, errMsg }) => {})
ipcRenderer.on('file-unable-to-send', (event, { errMsg }) => {})
*/
