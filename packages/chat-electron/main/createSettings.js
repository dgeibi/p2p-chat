const settings = require('electron-settings')

/* eslint-disable no-param-reassign */

module.exports = (locals) => {
  const { users, channels } = settings.getAll()
  locals.users = users
  locals.channels = channels

  settings.watch('users', (v) => {
    locals.users = v
    console.log(v)
  })
  settings.watch('channels', (v) => {
    locals.channels = v
    console.log(v)
  })

  return settings
}
