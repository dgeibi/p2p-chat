import { ipcRenderer } from 'electron'
import constants from '../../utils/constants'

const initialState = {
  messages: [],
}

const TYPES = {
  NEW_MESSAGE: '',
  FETCH_MESSAGES: '',
  MESSAGES_FETCHED: '',
}
constants(TYPES, 'DIALOG')

export default function dialog(state = initialState, action) {
  switch (action.type) {
    case TYPES.NEW_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
      }
    case TYPES.MESSAGES_FETCHED:
      return {
        ...state,
        messages: action.payload,
      }
    default:
      return state
  }
}

export const fetchMessages = (id) => {
  ipcRenderer.send('fetch-message', id)
  console.log(id)
  return {
    type: TYPES.FETCH_MESSAGES,
  }
}

export const messagesFetched = messages => ({
  type: TYPES.MESSAGES_FETCHED,
  payload: messages,
})
