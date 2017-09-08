import { loginActions } from '../views/SettingsRedux'
import { chatListActions } from '../views/AsideRedux'
import { dialogActions, filePanelActions } from '../views/ChattingRedux'
import { showError, showInfo } from '../utils/message'

export default function listen(on, dispatch) {
  on('setup-reply', (event, { errMsg, id }) => {
    if (!errMsg) {
      dispatch(loginActions.updateSettings(id))
      dispatch(chatListActions.show())
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
    dispatch(dialogActions.newMessage(message))
  })

  on('text-sent', (event, message) => {
    dispatch(dialogActions.textSent(message))
  })

  // file send
  on('file-sent', (event, info) => {
    dispatch(dialogActions.fileSentNotice(info))
  })

  on('file-send-fail', (event, info) => {
    dispatch(dialogActions.fileSendError(info))
  })

  on('file-unable-to-send', (event, { errMsg }) => {
    showError(errMsg)
  })

  // file receive
  on('fileinfo', (event, message) => {
    dispatch(filePanelActions.fileCome(message))
  })

  on('file-process-start', (event, message) => {
    dispatch(filePanelActions.fileStart(message))
  })

  on('file-processing', (event, message) => {
    dispatch(filePanelActions.fileProcessing(message))
  })

  on('file-process-done', (event, message) => {
    dispatch(filePanelActions.fileEnd(message))
  })

  on('file-receive-fail', (event, message) => {
    dispatch(filePanelActions.fileReceiveError(message))
  })

  on('file-receiced', (event, message) => {
    dispatch(filePanelActions.fileReceived(message))
  })
}
