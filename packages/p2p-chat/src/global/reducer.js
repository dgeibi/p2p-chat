import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import settings from '../views/SettingsRedux'
import aside from '../views/AsideRedux'
import chatting from '../views/ChattingRedux'
import modalbtns from '../views/ModalBtnRedux'

// const initialState = appReducer({}, {})

export default history => {
  const appReducer = combineReducers({
    settings,
    aside,
    chatting,
    modalbtns,
    router: connectRouter(history),
  })

  return (state, action) => {
    if (action.type === 'LOGOUT') {
      window.location.reload()
    }

    return appReducer(state, action)
  }
}
