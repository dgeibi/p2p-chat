import { push } from 'connected-react-router'
import constants from '../../../utils/constants'
import createReducer from '../../../utils/createReducer'

const TYPES = {
  SETUP: '',
  ADD_USER: '',
  CHANGE_DIALOG: '',
  OFF_USER: '',
  ADD_CHANNLE: '',
  SHOW_LIST: '',
  HIDE_LIST: '',
  CLEAR_BADGE: '',
  INCREASE_BADGE: '',
  RESET: '',
}
constants(TYPES, 'ASIDE')

const initalState = {
  users: {},
  channels: {},
  visible: false,
}

const reducerMap = {
  [TYPES.SETUP](state, action) {
    return {
      ...state,
      ...action.payload,
    }
  },
  [TYPES.OFF_USER](state, action) {
    return {
      ...state,
      users: {
        ...state.users,
        [action.payload.tag]: {
          ...state.users[action.payload.tag],
          ...action.payload,
          online: false,
        },
      },
    }
  },
  [TYPES.ADD_USER](state, action) {
    return {
      ...state,
      users: {
        ...state.users,
        [action.payload.tag]: {
          ...state.users[action.payload.tag],
          ...action.payload,
          online: true,
        },
      },
    }
  },
  [TYPES.ADD_CHANNLE](state, action) {
    return {
      ...state,
      channels: {
        ...state.channels,
        [action.payload.key]: action.payload,
      },
    }
  },
  [TYPES.SHOW_LIST](state) {
    return {
      ...state,
      visible: true,
    }
  },
  [TYPES.HIDE_LIST](state) {
    return {
      ...state,
      visible: false,
    }
  },
  [TYPES.INCREASE_BADGE](state, action) {
    const { type, key } = action.id
    const types = `${type}s`
    return {
      ...state,
      [types]: {
        ...state[types],
        [key]: {
          ...state[types][key],
          badge: (state[types][key].badge || 0) + 1,
        },
      },
    }
  },
  [TYPES.CLEAR_BADGE](state, action) {
    const { type, key } = action.id
    const types = `${type}s`
    if (!state[types][key].badge) return state
    return {
      ...state,
      [types]: {
        ...state[types],
        [key]: {
          ...state[types][key],
          badge: 0,
        },
      },
    }
  },
  [TYPES.RESET]() {
    return { ...initalState }
  },
}

export default createReducer(reducerMap, initalState)

export const setup = ({ users, channels }) => ({
  type: TYPES.SETUP,
  payload: { users, channels },
})

export const addUser = message => ({
  type: TYPES.ADD_USER,
  payload: message,
})

export const offUser = message => ({
  type: TYPES.OFF_USER,
  payload: message,
})

export const addChannel = channel => ({
  type: TYPES.ADD_CHANNLE,
  payload: channel,
})

export const show = () => ({
  type: TYPES.SHOW_LIST,
})

export const hide = () => ({
  type: TYPES.HIDE_LIST,
})

export const changeDialog = (type, key) => push(`/chat/${type}/${key}`)

export const clearBadge = id => ({
  type: TYPES.CLEAR_BADGE,
  id,
})

export const increaseBadge = id => ({
  type: TYPES.INCREASE_BADGE,
  id,
})

export const reset = () => ({
  type: TYPES.RESET,
})
