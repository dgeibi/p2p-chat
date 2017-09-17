import { combineReducers } from 'redux'

import { routerReducer } from 'react-router-redux'
import settings from '../views/SettingsRedux'
import aside from '../views/AsideRedux'
import chatting from '../views/ChattingRedux'
import modalbtns from '../views/ModalBtnRedux'

const appReducer = combineReducers({
  settings,
  aside,
  chatting,
  modalbtns,
  routing: routerReducer,
})

const initialState = appReducer({}, {})

export default (state, action) => {
  if (action.type === 'LOGOUT') {
    const { routing } = state
    return { ...initialState, routing }
  }

  return appReducer(state, action)
}
