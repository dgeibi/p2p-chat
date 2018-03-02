/* eslint-disable no-param-reassign */
import Store from 'electron-store'

export default locals => {
  const userConf = new Store({
    name: locals.tag,
    cwd: locals.settingsDir,
  })
  locals.users = userConf.get('users', {})
  locals.channels = userConf.get('channels', {})
  locals.userConf = userConf

  return userConf
}
