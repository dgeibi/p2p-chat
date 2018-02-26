/* eslint-disable global-require */
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { app } from 'electron'

export default () => {
  const settingsDir = join(app.getPath('appData'), app.getName(), 'ChatSettings')
  if (!existsSync(settingsDir)) mkdirSync(settingsDir)
  const downloadDir = join(app.getPath('downloads'), app.getName())
  if (!existsSync(downloadDir)) mkdirSync(downloadDir)
  return { settingsDir, downloadDir }
}
