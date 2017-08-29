import { loginActions } from '../views/SettingsRedux'
import { chatListActions } from '../views/AsideRedux'
import { dialogActions, filePanelActions } from '../views/ChattingRedux'
import { showError, showInfo } from '../utils/message'

export default function listen(on, store) {
  on('setup-reply', (event, { errMsg, id }) => {
    if (!errMsg) {
      store.dispatch(loginActions.updateSettings(id))
      store.dispatch(chatListActions.show())
    } else {
      showError(errMsg)
    }
  })

  on('logout-reply', (event, { errMsg }) => {
    if (errMsg) {
      showError(errMsg)
    } else {
      showInfo('Logouted.')
    }
  })

  on('bg-err', (event, { errMsg }) => {
    showError(errMsg)
  })

  on('text', (event, message) => {
    store.dispatch(dialogActions.newMessage(message))
  })

  on('text-sent', (event, message) => {
    store.dispatch(dialogActions.textSent(message))
  })

  // file send
  on('file-sent', (event, info) => {
    store.dispatch(dialogActions.fileSentNotice(info))
  })

  on('file-send-fail', (event, info) => {
    store.dispatch(dialogActions.fileSendError(info))
  })

  on('file-unable-to-send', (event, { errMsg }) => {
    showError(errMsg)
  })

  // file receive
  on('fileinfo', (event, message) => {
    store.dispatch(filePanelActions.fileCome(message))
  })

  on('file-process-start', (event, message) => {
    store.dispatch(filePanelActions.fileStart(message))
  })

  on('file-processing', (event, message) => {
    store.dispatch(filePanelActions.fileProcessing(message))
  })

  on('file-process-done', (event, message) => {
    store.dispatch(filePanelActions.fileEnd(message))
  })

  on('file-receive-fail', (event, message) => {
    store.dispatch(filePanelActions.fileReceiveError(message))
  })

  on('file-receiced', (event, message) => {
    store.dispatch(filePanelActions.fileReceived(message))
  })
}
