import { createAction } from 'redux-actions'
import constants from '../utils/constants'

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

export const modalBtnActions = {
  show: createAction(TYPES.SHOW),
  hide: createAction(TYPES.HIDE),
}

export function selectVisible(state, ownProp) {
  if (state[ownProp.id] === undefined) return !!ownProp.visibleDefault
  return !!state[ownProp.id]
}
