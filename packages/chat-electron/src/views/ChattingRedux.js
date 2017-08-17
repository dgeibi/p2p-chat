import { combineReducers } from 'redux'

import dialog, * as dialogActions from '../components/Chatting/DialogRedux'

export default combineReducers({ dialog })
export { dialogActions }
