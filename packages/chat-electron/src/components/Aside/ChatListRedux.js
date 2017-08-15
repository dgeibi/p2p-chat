import { ipcRenderer } from 'electron'
import constants from '../../utils/constants'

const TYPES = {
  SETUP: '',
  ADD_USER: '',
  CHANGE_DIALOG: '',
  REMOVE_USER: '',
  CREATE_CHANNLE: '',
  ADD_CHANNLE: '',
}
constants(TYPES, 'ASIDE')

const initalState = {
  users: {},
  channels: {},
}

export default (state = initalState, action) => {
  switch (action.type) {
    case TYPES.SETUP:
      return {
        ...state,
        ...action.payload,
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
    case TYPES.ADD_CHANNLE: {
      return {
        ...state,
        channels: {
          ...state.channels,
          [action.payload.key]: action.payload,
        },
      }
    }
    default:
      return state
  }
}

export const setup = ({ users, channels }) => ({
  type: TYPES.SETUP,
  payload: { users, channels },
})

export const addUser = (username, tag) => ({
  type: TYPES.ADD_USER,
  payload: {
    username,
    tag,
  },
})

export const removeUser = (username, tag) => ({
  type: TYPES.REMOVE_USER,
  payload: {
    username,
    tag,
  },
})

export const addChannel = channel => ({
  type: TYPES.ADD_CHANNLE,
  payload: channel,
})

export const createChannel = ({ tags, name }) => {
  ipcRenderer.send('create-channel', { tags, name })
  return {
    type: TYPES.CREATE_CHANNLE,
  }
}

// @todo
// export const changeDialog = (type, id) => ({
//   type: TYPES.CHANGE_DIALOG,
// })
