import { combineReducers } from 'redux'

import dialog, * as dialogActions from '../components/Chatting/Dialog/redux'
import filePanel, * as filePanelActions from '../components/Chatting/FilePanel/redux'

export default combineReducers({ dialog, filePanel })
export { dialogActions, filePanelActions }
