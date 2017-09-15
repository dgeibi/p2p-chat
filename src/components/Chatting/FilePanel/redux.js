import { ipcRenderer } from 'electron'
import makeConstants from '../../../utils/constants'
import getNewState from '../../../utils/getNewState'
import { fileLoadStates, cardTypes } from './constants'

const initialState = {
  user: {},
  channel: {},
}

const TYPES = {
  FILE_INFO: '',
  FILE_START: '',
  FILE_PROCESSING: '',
  FILE_END: '',
  FILE_FAIL: '',
  FILE_DONE: '',
  ACCEPT_FILE: '',
  CLEAR_PANEL: '',
  IGNORE_FILE: '',
}

makeConstants(TYPES, 'CHATTING_FILE')

export default function filePanel(state = initialState, action) {
  switch (action.type) {
    case TYPES.FILE_INFO: {
      const { type, key, id } = findPos(action.payload)
      return {
        ...state,
        [type]: {
          ...state[type],
          [key]: {
            [id]: action.payload,
            ...state[type][key],
          },
        },
      }
    }
    case TYPES.ACCEPT_FILE:
    case TYPES.FILE_START:
    case TYPES.FILE_END:
    case TYPES.FILE_PROCESSING:
    case TYPES.FILE_FAIL:
    case TYPES.FILE_DONE: {
      const { type, key, id } = findPos(action.payload)
      return {
        ...state,
        [type]: {
          ...state[type],
          [key]: {
            ...state[type][key],
            [id]: {
              ...state[type][key][id],
              ...action.payload,
            },
          },
        },
      }
    }
    case TYPES.CLEAR_PANEL: {
      const { type, key } = action.payload
      const newState = getNewState(state, type, key)
      const panel = newState[type][key]
      Object.values(panel).forEach(({ status, id }) => {
        if (
          status === undefined ||
          status === fileLoadStates.exception ||
          status === fileLoadStates.success
        ) {
          delete panel[id]
        }
      })
      return newState
    }
    case TYPES.IGNORE_FILE: {
      const { type, key, id } = findPos(action.payload)
      const newState = getNewState(state, type, key)
      const panel = newState[type][key]
      delete panel[id]
      return newState
    }
    default:
      return state
  }
}

export const fileCome = message => ({
  type: TYPES.FILE_INFO,
  payload: { ...message, type: cardTypes.INFO },
})

export const fileStart = message => ({
  type: TYPES.FILE_START,
  payload: {
    ...message,
    type: cardTypes.RECEIVE,
    percent: 0,
    speed: 0,
    status: fileLoadStates.active,
  },
})

export const fileProcessing = message => ({
  type: TYPES.FILE_PROCESSING,
  payload: message,
})

export const fileEnd = message => ({
  type: TYPES.FILE_END,
  payload: { ...message, percent: 1, speed: 0 },
})

export const fileReceiveError = message => ({
  type: TYPES.FILE_FAIL,
  payload: {
    ...message,
    status: fileLoadStates.exception,
  },
})

export const fileReceived = message => ({
  type: TYPES.FILE_DONE,
  payload: { ...message, status: fileLoadStates.success },
})

export const acceptFile = ({ tag, checksum, channel, id }) => {
  ipcRenderer.send('accept-file', {
    tag,
    checksum,
    payload: { checksum, channel, id },
  })
  return {
    type: TYPES.ACCEPT_FILE,
    payload: {
      tag,
      channel,
      id,
      status: fileLoadStates.waitting,
    },
  }
}

export const ignoreFile = ({ tag, channel, id }) => ({
  type: TYPES.IGNORE_FILE,
  payload: { tag, id, channel },
})

export const clearPanel = ({ type, key }) => ({
  type: TYPES.CLEAR_PANEL,
  payload: { type, key },
})

function findPos({ tag, channel, id }) {
  if (channel) {
    return { type: 'channel', key: channel, id }
  }
  return { type: 'user', key: tag, id }
}
