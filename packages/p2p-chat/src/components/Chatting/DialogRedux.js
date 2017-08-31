import { ipcRenderer } from 'electron'
import constants from '../../utils/constants'
import getNewState from '../../utils/getNewState'

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
  ADD_FILE: '',
  REMOVE_FILE: '',
  SET_TEXT: '',
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
      const newState = getNewState(state, type, key)
      if (newState[type][key].messages) {
        newState[type][key].messages = [...state[type][key].messages, action.payload]
      } else {
        newState[type][key].messages = [action.payload]
      }
      return newState
    }
    case TYPES.ADD_FILE: {
      const { type, key } = action.id
      const newState = getNewState(state, type, key)
      const s = newState[type][key]
      if (s.filePaths) {
        s.filePaths = [...new Set([...s.filePaths, action.payload])]
      } else {
        s.filePaths = [action.payload]
      }
      return newState
    }
    case TYPES.REMOVE_FILE: {
      const { type, key } = action.id
      const newState = getNewState(state, type, key)
      const s = newState[type][key]
      s.filePaths = s.filePaths.slice()
      const index = s.filePaths.indexOf(action.payload)
      s.filePaths.splice(index, 1)
      return newState
    }
    case TYPES.SEND_FILES: {
      const { type, key } = action.id
      const newState = getNewState(state, type, key)
      newState[type][key].filePaths = []
      return newState
    }
    case TYPES.SET_TEXT: {
      const { type, key } = action.id
      const newState = getNewState(state, type, key)
      newState[type][key].text = action.payload
      return newState
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
    id,
  }
}

export const sendFiles = (id, paths) => {
  const { tags, channel } = id

  paths.forEach((filepath) => {
    ipcRenderer.send('local-file', { tags, filepath, payload: { channel } })
  })

  return {
    type: TYPES.SEND_FILES,
    id,
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

export const addFile = (id, path) => ({
  type: TYPES.ADD_FILE,
  id,
  payload: path,
})

export const removeFile = (id, path) => ({
  type: TYPES.REMOVE_FILE,
  id,
  payload: path,
})

export const setText = (id, text) => ({
  type: TYPES.SET_TEXT,
  id,
  payload: text,
})
