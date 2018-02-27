/* eslint-disable no-param-reassign */
import path from 'path'
import settings from 'electron-settings'

export { settings }

export default locals => {
  // setPath
  const { settingsDir, tag } = locals
  const settingsFilePath = path.join(settingsDir, tag)
  settings.setPath(settingsFilePath)

  //  sync
  const { users, channels } = settings.getAll()
  locals.users = users || {}
  locals.channels = channels || {}

  return settings
}
