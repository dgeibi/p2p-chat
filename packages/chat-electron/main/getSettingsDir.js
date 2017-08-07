/* eslint-disable global-require */
const { join } = require('path')
const { existsSync, mkdirSync } = require('fs')

module.exports = () => {
  const { app } = require('electron')
  const settingDir = join(app.getPath('appData'), app.getName(), 'ChatSettings')
  if (!existsSync(settingDir)) mkdirSync(settingDir)
  return settingDir
}
