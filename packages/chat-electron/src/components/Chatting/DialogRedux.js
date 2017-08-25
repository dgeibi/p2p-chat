import { ipcRenderer } from 'electron'
import constants from '../../utils/constants'

const initialState = {
  user: {},
  channel: {},
}

const TYPES = {
  NEW_MESSAGE: '',
  FETCH_MESSAGES: '',
  MESSAGES_FETCHED: '',
  SEND_MY_MESSAGE: '',
  SEND_FILES: '',
  INIT_STORE: '',
}
constants(TYPES, 'DIALOG')

export default function dialog(state = initialState, action) {
  switch (action.type) {
    case TYPES.NEW_MESSAGE: {
      const type = action.payload.channel ? 'channel' : 'user'
      const key = action.payload.channel || action.payload.tag
      return {
        ...state,
        [type]: {
          ...state[type],
          [key]: [...(state[type][key] || []), action.payload],
        },
      }
    }
    case TYPES.SEND_MY_MESSAGE: {
      const { type, key } = action.id
      return {
        ...state,
        [type]: {
          ...state[type],
          [key]: [
            ...(state[type][key] || []),
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

export const newMessage = (msg) => {
  const payload = { ...msg }
  payload.uid = msg.username + performance.now()
  return {
    type: TYPES.NEW_MESSAGE,
    payload,
  }
}

export const sendMessage = (id, text) => {
  const { tags, channel } = id
  ipcRenderer.send('local-text', { tags, payload: { text, channel } })

  return {
    type: TYPES.SEND_MY_MESSAGE,
    payload: text,
    id,
  }
}

export const sendFiles = (id, filePaths) => {
  const { tags, channel } = id

  filePaths.forEach((filePath) => {
    ipcRenderer.send('local-file', { tags, filepath: filePath, payload: { channel } })
  })
  return {
    type: TYPES.SEND_FILES,
    id,
    filePaths,
  }
}
