/* enf */

export const logout = () => {}

export const updateSettings = (id) => {
  console.log(id)
  return {
    type: 'UPDATE_SETTINGS',
  }
}

export const setupAside = (users, channels) => {
  console.log(users, channels)
  return {
    type: 'SETUP_ASIDE',
  }
}

export const showError = (errMsg) => {
  console.error(errMsg)
  return {
    type: 'ERROR',
  }
}
