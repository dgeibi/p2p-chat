import { ipcRenderer } from 'electron'
import replaceable from 'p2p-chat-utils/event-replaceable'
import ipcListeners from '../effects/ipc-listeners'

export default (...args) => {
  const replace = replaceable({
    args,
    emitter: ipcRenderer,
    callback: ipcListeners,
    disable: !module.hot,
  })

  if (module.hot) {
    module.hot.accept('../effects/ipc-listeners', () => {
      replace(ipcListeners)
    })
  }
}
