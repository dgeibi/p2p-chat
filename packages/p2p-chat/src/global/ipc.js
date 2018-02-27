import { ipcRenderer } from 'electron'
import replaceable from 'p2p-chat-utils/event-replaceable'
import { loginActions } from '../views/SettingsRedux'
import { chatListActions } from '../views/AsideRedux'
import { dialogActions, filePanelActions } from '../views/ChattingRedux'
import { showError, showInfo } from '../utils/message'
import hot from '../utils/hot'

let replace
export default (...args) => {
  replace = replaceable({
    args,
    emitter: ipcRenderer,
    callback: listeners,
    disable: !module.hot,
  })
}

hot({
  sourceModule: module,
  replaceGetter: () => replace,
  args: [listeners],
})

function listeners(on, dispatch) {
  on('setup-reply', (event, { error, id }) => {
    if (!error) {
      dispatch(loginActions.updateSettings(id))
      dispatch(chatListActions.show())
      dispatch(dialogActions.restoreDialog(id.tag))
    } else {
      showError(error)
    }
  })

  on('logout-reply', (event, { error }) => {
    dispatch({ type: 'LOGOUT' })
    if (error) {
      showError(error)
    } else {
      showInfo('Logouted.')
    }
  })

  on('bg-err', (event, { error }) => {
    showError(error)
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

  on('file-unable-to-send', (event, { error }) => {
    showError(error)
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
