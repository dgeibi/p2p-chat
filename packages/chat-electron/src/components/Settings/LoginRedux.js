import { ipcRenderer } from 'electron'

import getConstants from '../../utils/constants'

const TYPES = {
  UPDATE_SETTINGS: '',
  LOGOUT: '',
}

getConstants(TYPES, 'LOGIN')
const initialState = {
  username: 'anonymous',
  port: 8087,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPES.UPDATE_SETTINGS: {
      return {
        ...state,
        ...action.payload,
      }
    }
    default:
      return state
  }
}

export const logout = () => {
  ipcRenderer.send('logout')
  return {
    type: TYPES.LOGOUT,
  }
}

export const updateSettings = (id) => {
  console.log(id)
  return {
    type: TYPES.UPDATE_SETTINGS,
    payload: id,
  }
}

// export const setupAside = (users, channels) => {
//   console.log(users, channels)
//   return {
//     type: TYPES.SETUP_ASIDE,
//   }
// }

// export const showError = (errMsg) => {
//   console.error(errMsg)
//   return {
//     type: TYPES.ERROR,
//   }
// }
