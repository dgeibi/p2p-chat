import { Menu } from 'electron'

const selectionMenu = Menu.buildFromTemplate([{ role: 'copy' }])

const inputMenu = Menu.buildFromTemplate([
  { role: 'undo' },
  { role: 'redo' },
  { type: 'separator' },
  { role: 'cut' },
  { role: 'copy' },
  { role: 'paste' },
  { type: 'separator' },
  { role: 'selectall' },
])

export default window => {
  window.webContents.on('context-menu', (e, props) => {
    const { selectionText, isEditable } = props
    if (isEditable) {
      inputMenu.popup(window)
    } else if (selectionText && selectionText.trim() !== '') {
      selectionMenu.popup(window)
    }
  })
}
