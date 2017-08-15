import { combineReducers } from 'redux'

import chatList, * as chatListActions from '../components/Aside/ChatListRedux'

export default combineReducers({ chatList })
export { chatListActions }
