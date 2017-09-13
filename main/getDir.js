/* eslint-disable global-require */
const { join } = require('path')
const { existsSync, mkdirSync } = require('fs')

module.exports = () => {
  const { app } = require('electron')
  const settingsDir = join(app.getPath('appData'), app.getName(), 'ChatSettings')
  if (!existsSync(settingsDir)) mkdirSync(settingsDir)
  const downloadDir = join(app.getPath('downloads'), app.getName())
  if (!existsSync(downloadDir)) mkdirSync(downloadDir)
  return { settingsDir, downloadDir }
}
