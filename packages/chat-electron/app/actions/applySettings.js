import { ipcRenderer } from 'electron'

export default function applySettings({ important, local }) {
  const { username, host, port, hostStart, hostEnd, portStart, portEnd, connects, login } = local

  const payload = {
    hostStart,
    hostEnd,
    portStart,
    portEnd,
    connects,
  }

  const newImportant = { username, host, port, login }
  const keys = ['username', 'host', 'port', 'login']
  if (important === null || keys.some(key => newImportant[key] !== important[key])) {
    const options = {
      username,
      host,
      port,
      payload,
    }
    ipcRenderer.send('setup', options)
  } else {
    ipcRenderer.send('change-setting', payload)
  }
}
