/* eslint-disable no-param-reassign */
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const { fork } = require('child_process')
const EventEmitter = require('events')
const logger = require('logger')

const tick = require('./main/count')()
require('./main/menu.js')
const pkg = require('./package.json')

const workerProxy = new EventEmitter()
let win
let worker

// Keep a reference for dev mode
const dev = process.argv.indexOf('--devServer') !== -1
const port = dev ? process.argv[process.argv.indexOf('--port') + 1] : null

function createWorker() {
  if (!tick()) return

  worker = fork(`${__dirname}/main/worker.js`, ['--color'])
  logger.debug(`new chat worker ${worker.pid}`)
  worker.on('message', (m) => {
    const { key, args, act, errMsg } = m
    if (key) {
      workerProxy.emit(key, ...args)
      win.webContents.send(key, ...args)
    } else if (act === 'suicide') {
      win.webContents.send('bg-err', { errMsg })
      createWorker()
    }
  })

  worker.on('error', (err) => {
    win.webContents.send('bg-err', { errMsg: err.message })
    logger.error(err)
    createWorker()
  })

  worker.on('exit', () => {
    logger.debug(`chat worker ${worker.pid} exits`)
  })
}
createWorker()

function createWindow() {
  win = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    width: 800,
    height: 600,
    title: pkg.name,
    webPreferences: {
      nodeIntegrationInWorker: true,
    },
  })

  const urlObj = Object.assign(
    {
      slashes: true,
      hash: 'settings',
    },
    dev
      ? {
        protocol: 'http:',
        host: `localhost:${port}`,
        pathname: 'index.html',
      }
      : {
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
      }
  )

  const indexPath = url.format(urlObj)

  win.loadURL(indexPath)

  win.on('closed', () => {
    win = null
  })
}

const frontToBack = (key) => {
  ipcMain.on(key, (event, ...args) => {
    worker.send({
      key,
      args,
    })
  })
}

frontToBack('local-file')
frontToBack('change-setting')
frontToBack('setup')
frontToBack('logout')
frontToBack('local-text')
frontToBack('accept-file')

workerProxy.on('setup-reply', ({ errMsg, id }) => {
  if (!errMsg) {
    const { username } = id
    win.setTitle(`${username}[${id.tag.slice(0, 5)}] - ${pkg.name}`)
  }
})

process.on('exit', () => {
  worker.kill()
})

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
