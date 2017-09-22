import has from 'p2p-chat-utils/has'

const createReducer = (reducerMap, initialState) => (state = initialState, action) => {
  if (has(reducerMap, action.type)) {
    return reducerMap[action.type](state, action)
  }
  return state
}

export default createReducer
