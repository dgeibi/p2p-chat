import { ipcRenderer } from 'electron'
import constants from '../../utils/constants'

const initialState = {
  user: {},
  channel: {},
}

const TYPES = {
  NEW_MESSAGE: '',
  MESSAGE_SENT: '',
  FETCH_MESSAGES: '',
  MESSAGES_FETCHED: '',
  SEND_MY_MESSAGE: '',
  SEND_FILES: '',
  FILE_SENT: '',
  FILE_SEND_ERROR: '',
}
constants(TYPES, 'DIALOG')

export default function dialog(state = initialState, action) {
  switch (action.type) {
    case TYPES.FILE_SENT:
    case TYPES.FILE_SEND_ERROR:
    case TYPES.MESSAGE_SENT:
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
    default:
      return state
  }
}

export const newMessage = (msg) => {
  const payload = { ...msg, uid: msg.tag + performance.now(), date: new Date() }
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

export const fileSentNotice = (info) => {
  const { filename, username } = info
  const message = `sent ${username} '${filename}' successfully.`
  const payload = {
    ...info,
    uid: info.filename + info.tag + performance.now(),
    alert: 'success',
    message,
  }
  return {
    type: TYPES.FILE_SENT,
    payload,
  }
}

export const textSent = (msg) => {
  const payload = { ...msg, uid: performance.now(), self: true, date: new Date() }
  return {
    type: TYPES.MESSAGE_SENT,
    payload,
  }
}

export const fileSendError = (info) => {
  const { filename, username, tag, errMsg } = info
  const message = `Failed to send ${username} '${filename}'`
  const description = errMsg
  const payload = {
    ...info,
    uid: filename + tag + performance.now(),
    alert: 'error',
    message,
    description,
  }
  return {
    type: TYPES.FILE_SEND_ERROR,
    payload,
  }
}
