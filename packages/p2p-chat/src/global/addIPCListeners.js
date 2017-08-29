import { ipcRenderer } from 'electron'
import replaceable from 'utils/event-replaceable'
import ipcListeners from '../side-effects/global-ipc'

export default (store) => {
  const replace = replaceable({
    emitter: ipcRenderer,
    callback: ipcListeners,
    args: [store],
    disable: !module.hot,
  })

  if (module.hot) {
    module.hot.accept('../side-effects/global-ipc', () => {
      replace(ipcListeners)
    })
  }
}
