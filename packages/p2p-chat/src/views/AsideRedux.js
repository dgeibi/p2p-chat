import { combineReducers } from 'redux'

import chatList, * as chatListActions from '../components/Aside/ChatList/redux'

export default combineReducers({ chatList })
export { chatListActions }
