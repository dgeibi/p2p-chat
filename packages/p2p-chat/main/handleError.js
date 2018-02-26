import electron from 'electron'

process.on('uncaughtException', err => {
  electron.dialog.showErrorBox(
    'A JavaScript error occurred in the main process',
    err.stack
  )
})
