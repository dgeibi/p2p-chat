/* eslint-disable no-param-reassign */
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const { fork } = require('child_process')
const EventEmitter = require('events')
const logger = require('logger')
const tick = require('./main/count')()
require('./main/menu.js')
const fs = require('fs-extra')
const pkg = require('./package.json')
const IPset = require('utils/ipset')
const each = require('utils/each')
const md5 = require('utils/md5')
const pick = require('utils/pick')

const getDir = require('./main/getDir')
const Settings = require('./main/Settings')

const workerEE = new EventEmitter()
let win
let worker
let settings
let setWrap

const locals = {
  users: null,
  channels: null,
  settingsDir: null,
  username: null,
}

// webpack-dev-server port
if (process.argv.indexOf('--devServer') !== -1) {
  const devPort = Math.floor(process.argv[process.argv.indexOf('--port') + 1])
  if (devPort) {
    locals.devPort = devPort
  }
}

createWorker()

function getIPsetStore(users) {
  const ipset = IPset()
  each(users, ({ host, port }) => {
    ipset.add(host, port)
  })
  return ipset.getStore()
}

// renderer events
ipcMain.on('setup', (event, opts) => {
  const oldName = locals.username
  const newName = opts.username || 'anonymous'

  locals.username = newName
  opts.username = newName
  opts.downloadDir = locals.downloadDir

  if (!settings) {
    setWrap = Settings(locals)
    settings = setWrap.getSettings()
  }

  if (oldName !== null && newName !== oldName) {
    fs.copySync(settings.file(), path.join(locals.settingsDir, newName))
  }

  setWrap.setPath()
  setWrap.sync()
  const { users, channels } = locals

  // to renderer
  event.sender.send('before-setup', { users, channels })
  opts.payload = opts.payload || {}
  opts.payload.ipsetStore = getIPsetStore(users)

  // to worker
  worker.send({
    key: 'setup',
    args: [opts],
  })
})

ipcMain.on('change-setting', (event, payload) => {
  payload.ipsetStore = getIPsetStore(locals.users || {})

  // to worker
  worker.send({
    key: 'change-setting',
    args: [payload],
  })
})

ipcMain.on('create-channel', (event, opts) => {
  const { tags } = opts
  opts.name = opts.name || 'default'
  const key = md5.dataSync(opts.name + Math.random())
  const users = getUserFullInfos(tags)
  users[locals.tag] = {
    tag: locals.tag,
    host: locals.host,
    port: locals.port,
  }
  const channel = {
    key,
    users,
    name: opts.name,
  }
  opts.payload = Object.assign({}, opts.payload, { channel, key })

  // store
  settings.set(`channels.${key}`, channel)

  // to renderer
  event.sender.send('channel-create', { channel, key })

  // to worker
  worker.send({
    key: 'create-channel',
    args: [opts],
  })
})

bypassRendererToWorker('local-file')
bypassRendererToWorker('logout')
bypassRendererToWorker('local-text')
bypassRendererToWorker('accept-file')

ipcMain.on('logout', () => {
  locals.username = null
  locals.channels = null
  locals.users = null
})

// worker events
workerEE.on('setup-reply', ({ errMsg, id }) => {
  if (!errMsg) {
    const { username, address, port, host, tag } = id
    locals.host = host || address
    locals.port = port
    locals.tag = tag
    win.setTitle(`${username}[${id.tag.slice(0, 5)}] - ${pkg.name}`)
  }
})

workerEE.on('login', ({ tag, username, host, port }) => {
  settings.set(`users.${tag}`, { tag, username, host, port })
})

workerEE.on('channel-create', ({ key, channel }) => {
  settings.set(`channels.${key}`, channel)
})

// exit worker
process.on('exit', () => {
  worker.kill()
})

app.on('ready', () => {
  createWindow()
  Object.assign(locals, getDir())
})

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

function createWorker() {
  if (!tick()) return
  worker = fork(`${__dirname}/main/worker.js`, ['--color'])
  logger.debug(`new chat worker ${worker.pid}`)
  worker.on('message', (m) => {
    const { key, args, act, errMsg } = m
    if (key) {
      workerEE.emit(key, ...args)
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

function createWindow() {
  // Keep a reference for dev mode
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
    },
    locals.devPort
      ? {
        protocol: 'http:',
        host: `localhost:${locals.devPort}`,
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

function bypassRendererToWorker(key) {
  ipcMain.on(key, (event, ...args) => {
    worker.send({
      key,
      args,
    })
  })
}

function getUserFullInfos(tags) {
  return pick(
    locals.users,
    {
      tag: 'tag',
      host: 'host',
      port: 'port',
    },
    tags
  )
}
