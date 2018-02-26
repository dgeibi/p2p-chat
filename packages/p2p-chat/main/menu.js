import electron from 'electron'

const { app, Menu, dialog } = electron

const template = [
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
    ],
  },
  {
    label: 'View',
    submenu: [
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click() {
          electron.shell.openExternal('https://github.com/dgeibi/p2p-chat')
        },
      },
      {
        label: 'Report Issues',
        click() {
          electron.shell.openExternal('https://github.com/dgeibi/p2p-chat/issues/new')
        },
      },
      {
        label: 'About',
        click() {
          const name = app.getName()
          dialog.showMessageBox({
            type: 'info',
            title: name,
            message: name,
            detail: `Version ${app.getVersion()}
Node ${process.versions.node}
Renderer ${process.versions.chrome}
Electron ${process.versions.electron}
Architecture ${process.arch}`,
            buttons: ['OK'],
          })
        },
      },
    ],
  },
]

if (process.platform === 'darwin') {
  // Edit menu
  template[0].submenu.push(
    { type: 'separator' },
    {
      label: 'Speech',
      submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
    }
  )
}

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
