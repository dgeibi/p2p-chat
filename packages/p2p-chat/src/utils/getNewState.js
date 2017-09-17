const getNewState = (state, key, ...restKeys) => {
  const newState = Object.assign({}, state)
  if (key) newState[key] = getNewState(newState[key], ...restKeys)
  return newState
}

export default getNewState
