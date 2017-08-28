import constants from '../../../utils/constants'

const initalState = {}

const TYPES = {
  SHOW: '',
  HIDE: '',
}
constants(TYPES, 'modalBtn')

export default (state = initalState, action) => {
  switch (action.type) {
    case TYPES.SHOW:
      return {
        ...state,
        [action.payload]: true,
      }
    case TYPES.HIDE:
      return {
        ...state,
        [action.payload]: false,
      }
    default:
      return state
  }
}

export const show = id => ({
  type: TYPES.SHOW,
  payload: id,
})

export const hide = id => ({
  type: TYPES.HIDE,
  payload: id,
})
