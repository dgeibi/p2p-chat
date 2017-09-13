/* eslint-disable no-param-reassign */
const electron = require('electron')
const path = require('path')
const url = require('url')
const { fork } = require('child_process')
const EventEmitter = require('events')
const logger = require('logger')
const tick = require('./main/count')()
require('./main/menu.js')
const pkg = require('./package.json')
const IPset = require('p2p-chat-utils/ipset')
const each = require('p2p-chat-utils/each')
const md5 = require('p2p-chat-utils/md5')
const pickByMap = require('p2p-chat-utils/pickByMap')

const getDir = require('./main/getDir')
const Settings = require('./main/Settings')
const setContextMenu = require('./main/setContextMenu')

const { app, BrowserWindow, ipcMain } = electron

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
  locals.username = opts.username || 'anonymous'
  opts.username = locals.username
  opts.downloadDir = locals.downloadDir

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
  win.setTitle(pkg.name)
})

// worker events
workerEE.on('setup-reply', ({ errMsg, id }) => {
  if (!errMsg) {
    const { username, address, port, host, tag } = id
    locals.host = host || address
    locals.port = port
    locals.tag = tag
    win.setTitle(`${username}[${id.tag.slice(0, 5)}] - ${pkg.name}`)
    loadSettings(locals)
  }
})

workerEE.on('login', ({ tag, username, host, port }) => {
  settings.set(`users.${tag}`, {
    tag,
    username,
    host,
    port,
  })
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
  const {
    workAreaSize: { width, height },
    scaleFactor: zoomFactor,
  } = electron.screen.getPrimaryDisplay()

  win = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    width,
    height,
    title: pkg.name,
    webPreferences: {
      zoomFactor,
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
        pathname: path.join(__dirname, pkg.output, 'index.html'),
        protocol: 'file:',
      }
  )

  const indexPath = url.format(urlObj)

  win.loadURL(indexPath)

  win.on('closed', () => {
    win = null
  })

  setContextMenu(win)
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
  return pickByMap(
    locals.users,
    {
      tag: 'tag',
      host: 'host',
      port: 'port',
    },
    tags
  )
}

function loadSettings(_locals) {
  setWrap = Settings(_locals)
  settings = setWrap.getSettings()
  setWrap.setPath()
  setWrap.sync()

  const { users, channels } = _locals

  const payload = {
    ipsetStore: getIPsetStore(users),
  }

  win.webContents.send('after-setup', { users, channels })

  worker.send({
    key: 'change-setting',
    args: [payload],
  })
}
