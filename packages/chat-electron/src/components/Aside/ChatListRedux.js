import { ipcRenderer } from 'electron'
import constants from '../../utils/constants'

const TYPES = {
  SET_USERS: '',
  ADD_USER: '',
  CHANGE_DIALOG: '',
  REMOVE_USER: '',
  CREATE_CHANNLE: '',
}
constants(TYPES, 'ASIDE')

const initalState = {
  users: {},
  channels: {},
}

export default (state = initalState, action) => {
  switch (action.type) {
    case TYPES.SET_USERS:
      return {
        ...state,
        users: action.payload,
      }
    case TYPES.ADD_USER: {
      return {
        ...state,
        users: {
          ...state.users,
          [action.payload.tag]: action.payload,
        },
      }
    }
    case TYPES.REMOVE_USER: {
      const { users } = state
      delete users[action.payload.tag]
      return {
        ...state,
        users: {
          ...users,
        },
      }
    }
    default:
      return state
  }
}

export const addUser = (username, tag) => ({
  type: TYPES.ADD_USER,
  payload: {
    username,
    tag,
  },
})

export const createChannel = () => {
  ipcRenderer.send()
  return {
    type: TYPES.CREATE_CHANNLE,
  }
}

export const removeUser = (username, tag) => ({
  type: TYPES.REMOVE_USER,
  payload: {
    username,
    tag,
  },
})

export const changeDialog = () => ({
  type: TYPES.CHANGE_DIALOG,
})

export const setUsers = users => ({
  type: TYPES.SET_USERS,
  payload: users,
})
