import { combineReducers } from 'redux'

import { routerReducer } from 'react-router-redux'
import settings from '../views/SettingsRedux'
import aside from '../views/AsideRedux'
import chatting from '../views/ChattingRedux'
import modalbtns from '../components/Common/ModalBtn/redux'

export default combineReducers({
  settings,
  aside,
  chatting,
  modalbtns,
  routing: routerReducer,
})
