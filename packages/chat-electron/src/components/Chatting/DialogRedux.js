import { ipcRenderer } from 'electron'
import constants from '../../utils/constants'

const initialState = {
  // messages: [],
  users: {
    // [tag]: []
  },
  channels: {
    // [key]: []
  },
  id: {},
}

const TYPES = {
  NEW_MESSAGE: '',
  FETCH_MESSAGES: '',
  MESSAGES_FETCHED: '',
  SEND_MY_MESSAGE: '',
  INIT_STORE: '',
}
constants(TYPES, 'DIALOG')

export default function dialog(state = initialState, action) {
  switch (action.type) {
    case TYPES.INIT_STORE: {
      const { type, key } = action.payload
      const types = `${type}s`
      if (!state[types][key]) {
        return {
          ...state,
          [types]: {
            ...state[types],
            [key]: [],
          },
        }
      }
      return state
    }
    case TYPES.NEW_MESSAGE: {
      console.log('new')
      const types = action.payload.channel ? 'channels' : 'users'
      const key = types === 'users' ? action.payload.tag : action.payload.channel
      return {
        ...state,
        [types]: {
          ...state[types],
          [key]: [...(state[types][key] || []), action.payload],
        },
      }
    }
    case TYPES.FETCH_MESSAGES: {
      const { type, key } = action.payload
      if (type === state.id.type && key === state.id.key) return state
      return {
        ...state,
        id: { type, key },
      }
    }
    case TYPES.SEND_MY_MESSAGE: {
      const { type, key } = state.id
      const types = `${type}s`
      return {
        ...state,
        [types]: {
          ...state[types],
          [key]: [
            ...state[types][key],
            {
              text: action.payload,
            },
          ],
        },
      }
    }
    default:
      return state
  }
}

export const fetchMessages = (id) => {
  console.log(id)
  return {
    type: TYPES.FETCH_MESSAGES,
    payload: id,
  }
}

export const newMessage = msg => ({
  type: TYPES.NEW_MESSAGE,
  payload: msg,
})

export const sendMessage = (id, text) => {
  console.log('actions', text)
  if (id.type === 'channel') {
    ipcRenderer.send('local-text', { tags: [id.key], payload: { text, channel: id.key } })
  } else {
    ipcRenderer.send('local-text', { tags: [id.key], payload: { text } })
  }
  return {
    type: TYPES.SEND_MY_MESSAGE,
    payload: text,
  }
}

export const initStore = id => ({
  type: TYPES.INIT_STORE,
  payload: id,
})
