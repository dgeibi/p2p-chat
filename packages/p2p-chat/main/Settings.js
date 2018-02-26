/* eslint-disable no-param-reassign */
/* eslint-disable global-require */
import path from 'path'
import settings from 'electron-settings'

export default locals => {
  settings.watch('users', v => {
    locals.users = v
  })
  settings.watch('channels', v => {
    locals.channels = v
  })

  const sync = () => {
    const { users, channels } = settings.getAll()
    locals.users = users || {}
    locals.channels = channels || {}
  }

  const setPath = () => {
    const { settingsDir, tag } = locals
    const settingsFilePath = path.join(settingsDir, tag)
    settings.setPath(settingsFilePath)
  }

  const getSettings = () => settings

  return {
    setPath,
    sync,
    getSettings,
  }
}
