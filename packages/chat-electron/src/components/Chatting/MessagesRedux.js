import getConstants from '../../utils/constants'

const initialState = []

const TYPES = getConstants('CHATTING', ['NEW_MESSAGE'])

export default function messages(state = initialState, action) {
  switch (action.type) {
    case TYPES.NEW_MESSAGE:
      // state.push()
      break
    default:
      break
  }
}
