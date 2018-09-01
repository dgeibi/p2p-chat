import { throttle } from 'lodash'

import watchState from '../../../utils/watchState'
import storage from '../../../utils/storage'

export default watchState(
  ['chatting', 'dialog'],
  throttle(
    (_dialog, state) => {
      const { logined, tag } = state.settings.login
      if (logined) {
        storage.set(`dialog-${tag}`, _dialog)
      }
    },
    200,
    { leading: true }
  )
)
