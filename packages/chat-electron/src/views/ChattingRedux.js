import { combineReducers } from 'redux'

import dialog, * as dialogActions from '../components/Chatting/DialogRedux'
import filePanel, * as filePanelActions from '../components/Chatting/FilePanelRedux'

export default combineReducers({ dialog, filePanel })
export { dialogActions, filePanelActions }
