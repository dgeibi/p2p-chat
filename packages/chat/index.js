/* eslint-disable no-param-reassign, no-continue */
const net = require('net')
const path = require('path')
const EventEmitter = require('events')

const emitter = new EventEmitter()
module.exports = emitter

const logger = require('logger')

const enhanceSocket = require('./lib/enhanceSocket')
const md5 = require('utils/md5')
const getNewHost = require('utils/get-new-address')
const isIPLarger = require('utils/is-ip-larger')

const each = require('utils/each')
const pick = require('utils/pick')

const IPset = require('utils/ipset')
const login = require('./lib/login')
const fileModule = require('./lib/file')

const locals = {
  active: false,
  clients: null,
  port: null,
  address: null,
  tag: null,
  username: null,
  downloadDir: 'Downloads',
}

// 已经确认接收的文件
const fileAccepted = {}

const getMessage = () => ({
  host: locals.address,
  port: locals.port,
  username: locals.username,
  tag: locals.tag,
})

/**
 * 校验、写入文件
 * @param {object} message
 */
function handleFile(socket, message) {
  const { tag, checksum, username, filepath, channel } = message
  const id = `${checksum}.${process.uptime()}`
  emitter.emit('file-process-start', { id, channel })

  const processing = (check, percent, speed) => {
    if (check !== checksum) return
    emitter.emit('file-processing', { id, percent, speed, channel })
  }

  const done = (check) => {
    if (check !== checksum) return
    socket.removeListener('file-processing', processing)
    socket.removeListener('file-done', done)
    emitter.emit('file-process-done', { id, channel })
  }

  const close = (check) => {
    if (check !== checksum) return
    socket.removeListener('file-close', close)

    const filename = path.basename(filepath)
    md5.file(filepath, false, (md5Err, realChecksum) => {
      // 检查checksum
      if (md5Err || !fileAccepted[realChecksum] || realChecksum !== checksum) {
        emitter.emit('file-receive-fail', { tag, username, filename, id, channel })
      }
      emitter.emit('file-receiced', { tag, username, filename, filepath, id, channel })
      logger.verbose('file receiced', filepath)
      fileAccepted[realChecksum] = false
    })
  }

  socket.on('file-processing', processing)
  socket.on('file-done', done)
  socket.on('file-close', close)
}

/**
 * 套接字处理
 * @param {net.Socket} socket
 * @param {{greeting: boolean, reGreeting: boolean}} opts
 */
function handleSocket(socket, opts = {}) {
  const { greeting } = opts

  enhanceSocket({
    socket,
    parse: true,
    dirname: path.resolve(locals.downloadDir, locals.username),
  })

  // 连接服务器后，发送信息
  if (greeting) socket.send(getGreetingMsg())

  // 连接出错，进行下线处理
  socket.on('error', () => {
    peopleLogout(socket)
  })

  // 收到第一个报文，一个会话开始
  socket.once('message', (session) => {
    const { tag, type } = session

    // 对发送文件的socket特殊处理
    if (locals.clients[tag] && session.type === 'file' && fileAccepted[session.checksum]) {
      handleFile(socket, session)
      return
    }

    // 不符合预期的报文，或者重复连接 -> 断开连接
    if ((type !== 'greeting' && type !== 'greeting-reply') || locals.clients[tag]) {
      socket.destroy()
      return
    }

    // 回复信息
    const msg = getMessage()
    msg.type = 'greeting-reply'
    socket.send(msg)

    if (type === 'greeting') {
      waitReply(socket, session)
    } else {
      bindSocket(socket, session)
    }
  })
}

function waitReply(socket, preSession) {
  socket.once('message', (session) => {
    const { type, tag } = session
    if (type !== 'greeting-reply' || preSession.tag !== tag) {
      socket.destroy()
      return
    }
    bindSocket(socket, session)
  })
}

function bindSocket(socket, session) {
  const { username, tag } = session

  // 添加信息，存入 local.clients
  socket.info = Object.assign({ localTag: locals.tag }, session)
  // 已登录的提示
  if (!locals.clients[tag]) {
    logger.verbose(`${username}[${tag}] login.`)
    emitter.emit('login', session)
  }
  locals.clients[tag] = socket

  // 连接断开后，进行一些处理
  socket.on('end', () => {
    peopleLogout(socket)
  })

  // 处理报文
  socket.on('message', (message) => {
    switch (message.type) {
      case 'fileinfo': {
        message.id = `${message.checksum}.${process.uptime()}`
        emitter.emit('fileinfo', message)
        break
      }
      case 'text': {
        emitter.emit('text', message)
        break
      }
      case 'file-accepted': {
        sendFile(message)
        break
      }
      case 'channel-create': {
        handleChannelCreate(message)
        break
      }
      default:
        break
    }
  })
}

const defaultOpts = {
  username: 'anonymous',
  port: 8087,
}

/**
 * @typedef setupPayload
 * @type {object}
 * @prop {object} ipsetStore
 * @prop {object} ipset
 * @prop {string} hostStart
 * @prop {string} hostEnd address from hostStart to hostEnd
 * @prop {number} portStart
 * @prop {number} portEnd scan from portStart to portEnd
 * @prop {Array<{ port: number, host: string }>} connects
 */

/**
 * @typedef setupOpts
 * @type {object}
 * @prop {string} username
 * @prop {string} host local host (optional)
 * @prop {number} port local port
 * @prop {setupPayload} payload
 */

/**
 * 上线：启动服务器
 * @param {setupOpts} options
 * @param {function} callback
 */
function setup(options, callback) {
  // 已经处于启动状态，重新启动
  if (locals.active) {
    // 保存用户地址/端口到 ipset
    options.payload = options.payload || {}
    options.payload.ipset = options.payload.ipset
      ? options.payload.ipset.mergeStore(options.payload.ipsetStore)
      : IPset(options.payload.ipsetStore)
    options.payload.ipsetMerged = true

    // 退出后启动
    exit((err) => {
      if (!err) {
        setup(options, callback)
      } else {
        callback(err)
      }
    })
    return
  }

  const opts = Object.assign({}, defaultOpts, options)
  opts.port = Math.trunc(opts.port)
  if (isNaN(opts.port) || opts.port < 2000 || opts.port > 59999) {
    callback(TypeError('port should be a integer (2000~59999)'))
    return
  }
  if (typeof opts.username !== 'string') {
    callback(TypeError('username should be a string'))
    return
  }

  login(opts, (error, id) => {
    // id has props from opts
    if (error) {
      callback(error)
      return
    }
    const payload = id.payload || {}
    id.payload = undefined
    Object.assign(locals, id)
    locals.clients = {}

    // 1. create server, sending data
    const server = net.createServer((socket) => {
      handleSocket(socket)
    })

    // receive store from opt
    if (payload.ipset) {
      payload.ipset = payload.ipsetMerged
        ? payload.ipset
        : payload.ipset.mergeStore(payload.ipsetStore)
    } else {
      payload.ipset = IPset(payload.ipsetStore)
    }

    // 2. start listening
    const { host, port, username, tag, address } = id
    server.listen({ port, host }, () => {
      locals.server = server
      logger.verbose('>> opened server on', server.address())
      logger.verbose(`>> Hi! ${username}[${tag}]`)

      // 3. connect to other servers
      connectServers(payload)
      locals.active = true
      callback(null, { host, port, username, tag, address })
    })
  })
}

/**
 * 连接其它服务器
 * @param {setupPayload} opts
 */
function connectServers(opts) {
  if (!locals.server.listening) return
  opts.ipset = opts.ipset || IPset()
  // 1. 添加指定范围内的地址/端口
  connectRange(opts)
  // 2. 添加分散的地址/端口
  if (opts.connects) {
    opts.connects.forEach((conn) => {
      const host = conn.host || locals.address
      const port = conn.port
      opts.ipset.add(host, port)
    })
    delete opts.connects
  }
  // 3. 连接 ipset 里的所有服务器地址
  connect(opts.ipset)
}

function connect(ipset, excludes) {
  ipset.remove(locals.address, locals.port)
  ipset.forEach((host, port) => {
    if (excludes && excludes.has(host, port)) return
    const socket = net
      .connect(port, host, () => {
        handleSocket(socket, { greeting: true })
      })
      .on('error', () => {})
  })
}

/**
 * 将 from ~ to 范围内的地址添加到 ipset
 * @param {string} from
 * @param {string} to
 * @param {number} port
 * @param {object} ipset
 */
function connectHostRange(from, to, port, ipset) {
  if (isIPLarger(from, to)) return // 超过范围
  ipset.add(from, port)
  connectHostRange(getNewHost(from), to, port, ipset)
}

/**
 * 将 hostStart~hostEnd:portStart:portEnd 的地址添加到 ipset
 * @param {setupOpts} opts
 */
function connectRange(opts) {
  const { hostStart, portStart, ipset } = opts
  let { hostEnd, portEnd } = opts
  if (!portStart) return
  if (portEnd && portEnd < portStart) return
  if (hostStart && !hostEnd) hostEnd = hostStart

  if (!portEnd) portEnd = portStart + 1
  else portEnd += 1

  if (hostStart) {
    for (let port = portStart; port < portEnd; port += 1) {
      connectHostRange(hostStart, hostEnd, port, ipset)
    }
  } else {
    const host = locals.address
    for (let port = portStart; port < portEnd; port += 1) {
      ipset.add(host, port)
    }
  }
}

/**
 * 获取好友信息
 * @returns {Array<{tag: string, username: string}>}
 */
function getOnlineUser() {
  const infos = pick(locals.clients, {
    tag: ['info', 'tag'],
    username: ['info', 'username'],
  })
  return infos
}

/**
 * 发送文本
 * @param {Array<string>} tags
 * @param {string} text
 */
function textToUsers(opts) {
  const { tags, payload } = opts
  const message = Object.assign(getMessage(), payload)
  message.type = 'text'

  each(locals.clients, tags, (socket) => {
    socket.send(message)
  })
}

/**
 * 发送文件
 * @param {Array<string>} tags
 * @param {string} filepath
 */
function sendFileToUsers(opts) {
  const { tags, filepath, payload } = opts
  const msg = Object.assign(getMessage(), payload)

  fileModule.getInfoMsg(filepath, msg, (err, message) => {
    if (err) {
      logger.err(err)
      emitter.emit('file-unable-to-send', { errMsg: err.message })
      return
    }
    each(locals.clients, tags, (socket) => {
      socket.send(message)
    })
  })
}

// 同意接收文件
function acceptFile(opts) {
  const { tag, checksum, payload } = opts
  const socket = locals.clients[tag]
  if (socket) {
    const message = Object.assign(getMessage(), payload)
    message.type = 'file-accepted'
    fileAccepted[checksum] = true
    socket.send(message)
  }
}

/**
 * 登出/下线
 * @param {function(?Error)} callback
 */
function exit(callback) {
  if (locals.active) {
    each(locals.clients, (client) => {
      client.end()
      client.destroy()
    })
    locals.server.close(() => {
      locals.active = false
      logger.verbose(`>> Bye! ${locals.username}[${locals.tag}]`)
      setImmediate(callback) // when reloading, why process.nextTick make the app slow
    })
  } else {
    callback()
  }
}

/**
 * 连接断开/出错，下线
 * @param {{info: {localTag: string, tag: string, username: string}}} socket
 */
function peopleLogout(socket) {
  const { username, tag, localTag } = socket.info || {}
  if (localTag === locals.tag) {
    if (locals.clients[tag] && locals.clients[tag].destroyed === false) {
      locals.clients[tag].destroy()
    }
    delete locals.clients[tag]
    logger.verbose(`${username}[${tag}] logout.`)
    emitter.emit('logout', { tag, username })
  }
}

function createChannel(opts) {
  // send message
  const { payload, tags } = opts
  const message = Object.assign(getMessage(), payload)
  message.type = 'channel-create'

  each(locals.clients, tags, (socket) => {
    socket.send(message)
  })
}

function sendFile(message) {
  const { checksum, port, host } = message
  fileModule.send(checksum, { port, host }, (e, filename) => {
    const payload = Object.assign({}, message)
    if (e) {
      payload.errMsg = e.message
      logger.err('file-send-fail', filename, payload.errMsg)
      emitter.emit('file-send-fail', payload)
    } else {
      emitter.emit('file-sent', payload)
    }
  })
}

function handleChannelCreate({ tag, key, channel }) {
  emitter.emit('channel-create', { tag, key, channel })
  const ipset = IPset()
  each(channel.users, ({ host, port }) => {
    ipset.add(host, port)
  })
  each(locals.clients, ({ info: { host, port } }) => {
    ipset.remove(host, port)
  })
  connect(ipset)
}

function getGreetingMsg() {
  const msg = getMessage()
  msg.type = 'greeting'
  return msg
}

Object.assign(emitter, {
  locals,
  setup,
  exit,
  getOnlineUser,
  textToUsers,
  sendFileToUsers,
  acceptFile,
  emitter,
  connectServers,
  createChannel,
})
