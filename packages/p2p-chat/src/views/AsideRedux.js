import { combineReducers } from 'redux'
import { matchPath } from 'react-router'

import chatList, * as chatListActions from '../components/Aside/ChatListRedux'

const selectors = {
  selectChattingID({ routing: { location } }) {
    if (!location) return null
    const match = matchPath(location.pathname, {
      path: '/chat/:type/:key',
    })
    if (match) return match.params
    return null
  },
}

export default combineReducers({ chatList })
export { chatListActions, selectors }
