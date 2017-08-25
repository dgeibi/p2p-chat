import React from 'react'
import { render } from 'react-dom'
import { ipcRenderer } from 'electron'

import { store } from './redux'
import { showError } from './utils/message'
import { loginActions } from './views/SettingsRedux'
import { chatListActions } from './views/AsideRedux'
import { dialogActions, filePanelActions } from './views/ChattingRedux'
import App from './layouts/App'

render(<App />, document.querySelector('#root'))

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

ipcRenderer.on('text', (event, message) => {
  store.dispatch(dialogActions.newMessage(message))
})

/* file receive */
ipcRenderer.on('fileinfo', (event, message) => {
  store.dispatch(filePanelActions.fileCome(message))
})

ipcRenderer.on('file-process-start', (event, message) => {
  store.dispatch(filePanelActions.fileStart(message))
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
// file:send
ipcRenderer.on('file-sent', (event, { tag, username, filename }) => {})
ipcRenderer.on('file-send-fail', (event, { tag, username, filename, errMsg }) => {})
ipcRenderer.on('file-unable-to-send', (event, { errMsg }) => {})
*/
