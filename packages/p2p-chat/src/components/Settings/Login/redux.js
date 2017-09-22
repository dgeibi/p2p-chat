import { ipcRenderer } from 'electron'
import { push } from 'react-router-redux'

import createReducer from '../../../utils/createReducer'
import getConstants from '../../../utils/constants'

const TYPES = {
  UPDATE_SETTINGS: '',
  LOGOUT: '',
}

getConstants(TYPES, 'LOGIN')
const initialState = {
  username: 'anonymous',
  port: 8087,
  logined: false,
}

const reducerMap = {
  [TYPES.UPDATE_SETTINGS](state, action) {
    return {
      ...state,
      ...action.payload,
      logined: true,
    }
  },
  [TYPES.LOGOUT](state) {
    return {
      ...state,
      logined: false,
    }
  },
}

export default createReducer(reducerMap, initialState)

export const logout = () => {
  ipcRenderer.send('logout')
  return {
    type: TYPES.LOGOUT,
  }
}

export const updateSettings = id => ({
  type: TYPES.UPDATE_SETTINGS,
  payload: id,
})

export const backToRoot = () => push('/')
