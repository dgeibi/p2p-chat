/* eslint-disable no-param-reassign */
import './handleError'
import path from 'path'
import url from 'url'
import cp from 'child_process'
import EventEmitter from 'events'
import logger from 'p2p-chat-logger'
import electron from 'electron'
import IPset from 'p2p-chat-utils/ipset'
import { ensureDirSync } from 'fs-extra'

import count from './count'
import './menu'
import pkg from '../package.json'
import each from 'p2p-chat-utils/each'
import md5 from 'p2p-chat-utils/md5'
import pickByMap from 'p2p-chat-utils/pickByMap'
import loadUserConf from './loadUserConf'
import setContextMenu from './setContextMenu'
import makePlainError from './makePlainError'

process.on('uncaughtException', handleError)

const tick = count()

const { app, BrowserWindow, ipcMain } = electron

const chatProxy = new EventEmitter()
/** @type {BrowserWindow} */
let win
/** @type {cp.ChildProcess} */
let worker

const locals = {
  users: null,
  channels: null,
  username: null,
  tag: null,
  host: null,
  port: null,
  downloadDir: null,
  settingsDir: null,
  devPort: Math.floor(process.env.DEV_PORT),
  userConf: null,
  appName: null,
}

// webpack-dev-server port
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
  locals.userConf.set(`channels.${key}`, channel)

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
  Object.assign(locals, {
    username: null,
    channels: null,
    users: null,
    host: null,
    port: null,
    tag: null,
    userConf: null,
  })
  win.setTitle(pkg.name)
})

// worker events
chatProxy.on('setup-reply', ({ error, id }) => {
  if (!error) {
    const { username, address, port, host, tag } = id
    locals.host = host || address
    locals.port = port
    locals.tag = tag
    win.setTitle(`${username}[${id.tag.slice(0, 5)}] - ${pkg.name}`)
    loadSettings(locals)
  } else {
    logger.err('setup failed\n', error)
  }
})

chatProxy.on('logout-reply', ({ error }) => {
  if (error) {
    logger.err('logout failed\n', error)
  }
})

chatProxy.on('login', ({ tag, username, host, port }) => {
  locals.userConf.set(`users.${tag}`, {
    tag,
    username,
    host,
    port,
  })
})

chatProxy.on('channel-create', ({ key, channel }) => {
  locals.userConf.set(`channels.${key}`, channel)
})

// exit worker
process.on('exit', () => {
  worker.kill()
})

app.on('ready', () => {
  const appName = app.getName()
  const settingsDir = path.join(app.getPath('appData'), appName, 'ChatSettings')
  ensureDirSync(settingsDir)
  const downloadDir = path.join(app.getPath('downloads'), appName)
  ensureDirSync(downloadDir)
  Object.assign(locals, {
    downloadDir,
    settingsDir,
  })

  createWindow()
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

function handleWorkerError(err) {
  win.webContents.send('bg-err', { error: makePlainError(err) })
  logger.error(err)
  if (worker && !worker.killed) worker.kill()
  createWorker()
}

function createWorker() {
  if (!tick()) return
  worker = cp.fork(`${__dirname}/worker.js`, ['--color'])
  logger.debug(`new chat worker ${worker.pid}`)
  worker.on('message', m => {
    const { key, args, act, error } = m
    if (key) {
      chatProxy.emit(key, ...args)
      win.webContents.send(key, ...args)
    } else if (act === 'suicide') {
      handleWorkerError(error)
    }
  })

  worker.on('error', handleWorkerError)

  worker.on('exit', () => {
    logger.debug(`chat worker ${worker.pid} exits`)
  })
}

function createWindow() {
  win = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    width: 800,
    height: 600,
    title: pkg.name,
  })

  const urlObj = Object.assign(
    {
      slashes: true,
    },
    locals.devPort > 2000
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
  loadUserConf(_locals)
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

function handleError() {
  if (worker && !worker.killed) {
    worker.on('close', () => {
      process.exit(1)
    })
    worker.kill()
  } else {
    process.exit(1)
  }
}
