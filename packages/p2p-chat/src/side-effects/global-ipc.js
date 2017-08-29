import { ipcRenderer } from 'electron'

import { loginActions } from '../views/SettingsRedux'
import { chatListActions } from '../views/AsideRedux'
import { dialogActions, filePanelActions } from '../views/ChattingRedux'
import { showError, showInfo } from '../utils/message'

export default (store, hot) => {
  if (hot) return
  ipcRenderer.on('setup-reply', (event, { errMsg, id }) => {
    if (!errMsg) {
      store.dispatch(loginActions.updateSettings(id))
      store.dispatch(chatListActions.show())
    } else {
      showError(errMsg)
    }
  })

  ipcRenderer.on('logout-reply', (event, { errMsg }) => {
    if (errMsg) {
      showError(errMsg)
    } else {
      showInfo('Logouted.')
    }
  })

  ipcRenderer.on('bg-err', (event, { errMsg }) => {
    showError(errMsg)
  })

  ipcRenderer.on('text', (event, message) => {
    store.dispatch(dialogActions.newMessage(message))
  })

  ipcRenderer.on('text-sent', (event, message) => {
    store.dispatch(dialogActions.textSent(message))
  })

  // file send
  ipcRenderer.on('file-sent', (event, info) => {
    store.dispatch(dialogActions.fileSentNotice(info))
  })

  ipcRenderer.on('file-send-fail', (event, info) => {
    store.dispatch(dialogActions.fileSendError(info))
  })

  ipcRenderer.on('file-unable-to-send', (event, { errMsg }) => {
    showError(errMsg)
  })

  // file receive
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
}
