/* eslint-disable no-param-reassign, no-continue */
const net = require('net')
const path = require('path')
const EventEmitter = require('events')

const emitter = new EventEmitter()

const logger = require('logger')

const enhanceSocket = require('./lib/enhanceSocket')
const md5 = require('./lib/utils/md5')
const getNewHost = require('./lib/utils/getNewHost')
const isIPLarger = require('./lib/utils/isIPLarger')

const ipSet = require('./lib/ipSet')
const login = require('./lib/login')
const fileModule = require('./lib/file')

const local = {
  active: false,
  clients: null,
}

// 已经确认接收的文件
const fileAccepted = {}

const getMessage = () => ({
  type: 'greeting',
  host: local.address,
  port: local.port,
  username: local.username,
  tag: local.tag,
})

/**
 * 校验、写入文件
 * @param {object} message
 */
function handleFile(socket, message) {
  const { tag, checksum, username, filepath } = message
  const id = `${checksum}.${process.uptime()}`
  emitter.emit('file-process-start', { id })

  const processing = (check, percent, speed) => {
    if (check !== checksum) return
    emitter.emit('file-processing', { id, percent, speed })
  }

  const done = (check) => {
    if (check !== checksum) return
    socket.removeListener('file-processing', processing)
    socket.removeListener('file-done', done)
    emitter.emit('file-process-done', { id })
  }

  const close = (check) => {
    if (check !== checksum) return
    socket.removeListener('file-close', close)

    const filename = path.basename(filepath)
    md5.file(filepath, false, (md5Err, realChecksum) => {
      // 检查checksum
      if (md5Err || !fileAccepted[realChecksum] || realChecksum !== checksum) {
        emitter.emit('file-receive-fail', { tag, username, filename, id })
      }
      emitter.emit('file-receiced', { tag, username, filename, filepath, id })
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
  const { reGreeting, greeting } = opts

  enhanceSocket({
    socket,
    parse: true,
    dirname: path.resolve('Downloads', local.username),
  })

  // 连接服务器后，发送信息
  if (greeting) socket.send(getMessage())

  // 连接出错，进行下线处理
  socket.on('error', () => {
    peopleLogout(socket)
  })

  // 收到第一个报文，一个会话开始
  socket.once('message', (session) => {
    const { tag, username } = session

    // 对发送文件的socket特殊处理
    if (local.clients[tag] && session.type === 'file' && fileAccepted[session.checksum]) {
      handleFile(socket, session)
      return
    }

    // 不符合预期的报文，或者重复连接 -> 断开连接
    if (session.type !== 'greeting' || local.clients[tag]) {
      socket.end()
      return
    }

    // 添加信息
    socket.info = Object.assign({ localTag: local.tag }, session)
    // 存入 local.clients
    local.clients[tag] = socket

    // 已登录的提示
    logger.verbose(`${username}[${tag}] login.`)
    emitter.emit('login', { tag, username })

    // 服务器被连接后，回复信息
    if (reGreeting) {
      const msg = getMessage()
      socket.send(msg)
    }

    // 连接断开后，进行一些处理
    socket.on('end', () => {
      peopleLogout(socket)
    })

    socket.on('message', (message) => {
      // 处理报文
      const { type, checksum, text } = message
      switch (type) {
        case 'fileinfo': {
          message.id = `${checksum}.${process.uptime()}`
          emitter.emit('fileinfo', message)
          break
        }
        case 'text': {
          emitter.emit('text', { tag, username, text })
          break
        }
        case 'file-accepted': {
          fileModule.send(
            checksum,
            {
              port: message.port,
              host: message.host,
            },
            (e, filename) => {
              if (e) {
                const errMsg = e.message
                logger.err('file-send-fail', filename, errMsg)
                emitter.emit('file-send-fail', { tag, username, filename, checksum, errMsg })
              } else {
                emitter.emit('file-sent', { tag, username, filename, checksum })
              }
            }
          )
          break
        }
        default:
          break
      }
    })
  })
}

const defaultOpts = {
  username: 'anonymous',
  port: 8087,
}

/**
 * @typedef setupOpts
 * @type {object}
 * @prop {string} username
 * @prop {string} host local host (optional)
 * @prop {number} port local port
 * @prop {string} hostStart
 * @prop {string} hostEnd address from hostStart to hostEnd
 * @prop {number} portStart
 * @prop {number} portEnd scan from portStart to portEnd
 * @prop {Array<{ port: {number}, host:{string} }>} connects
 */

/**
 * 上线：启动服务器
 * @param {setupOpts} options
 * @param {function} callback
 */
function setup(options, callback) {
  // 已经处于启动状态，重新启动
  if (local.active) {
    // 保存用户地址/端口到 ipset
    options.ipset = ipSet()
    allClients((client) => {
      const { host, port } = client.info
      options.ipset.add(host, port)
    })

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
    if (error) {
      callback(error)
      return
    }
    Object.assign(local, id)
    local.clients = {}

    const { host, port, username, tag } = id
    // 1. create server, sending data
    const server = net.createServer((socket) => {
      handleSocket(socket, { reGreeting: true })
    })

    // 2. start listening
    server.listen({ port, host }, () => {
      local.server = server
      logger.verbose('>> opened server on', server.address())
      logger.verbose(`>> Hi! ${username}[${tag}]`)

      // 3. connect to other servers
      connectServers(opts)
      local.active = true
      callback(null, id)
    })
  })
}

/**
 * 连接其它服务器
 * @param {setupOpts} opts
 */
function connectServers(opts) {
  if (!local.server.listening) return
  if (!opts.ipset) opts.ipset = ipSet()
  // 1. 添加指定范围内的地址/端口
  connectRange(opts)
  // 2. 添加分散的地址/端口
  if (opts.connects) {
    opts.connects.forEach((conn) => {
      const host = conn.host || local.address
      const port = conn.port
      opts.ipset.add(host, port)
    })
    delete opts.connects
  }
  // 3. 连接 ipset 里的所有服务器地址
  opts.ipset.forEach((host, port) => {
    if (!(port === local.port && host === local.address)) {
      const socket = net
        .connect(port, host, () => {
          handleSocket(socket, { greeting: true })
        })
        .on('error', () => {})
    }
  })
}

/**
 * 将 from ~ to 范围内的地址添加到 ipset
 * @param {string} from
 * @param {string} to
 * @param {number} port
 * @param {ipSet} ipset
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
    const host = local.address
    for (let port = portStart; port < portEnd; port += 1) {
      ipset.add(host, port)
    }
  }
}

/**
 * 获取好友信息
 * @returns {Array<{tag: string, username: string}>}
 */
function getUserInfos() {
  return Object.keys(local.clients).map(tag => ({
    tag,
    username: local.clients[tag].info.username,
  }))
}

/**
 * 发送文本
 * @param {Array<string>} tags
 * @param {string} text
 */
function textToUsers(tags, text) {
  const message = getMessage()
  message.type = 'text'
  message.text = text
  tags.forEach((tag) => {
    const socket = local.clients[tag]
    socket.send(message)
  })
}

/**
 * 发送文件
 * @param {Array<string>} tags
 * @param {string} filepath
 */
function sendFileToUsers(tags, filepath) {
  fileModule.getInfoMsg(filepath, getMessage(), (err, message) => {
    if (err) {
      logger.err(err)
      emitter.emit('file-unable-to-send', { errMsg: err.message })
      return
    }
    tags.forEach((tag) => {
      const socket = local.clients[tag]
      socket.send(message)
    })
  })
}

/**
 * 对所有的连接执行 fn
 * @param {function(object)} fn
 */
function allClients(fn) {
  Object.keys(local.clients).forEach((tag) => {
    fn(local.clients[tag])
  })
}

// 同意接收文件
function acceptFile(tag, checksum) {
  const socket = local.clients[tag]
  if (socket) {
    const message = getMessage()
    message.type = 'file-accepted'
    message.checksum = checksum
    fileAccepted[checksum] = true
    socket.send(message)
  }
}

/**
 * 登出/下线
 * @param {function(?Error)} callback
 */
function exit(callback) {
  if (local.active) {
    allClients((client) => {
      client.end()
      client.destroy()
    })
    local.server.close(() => {
      local.active = false
      logger.verbose(`>> Bye! ${local.username}[${local.tag}]`)
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
  if (localTag === local.tag) {
    delete local.clients[tag]
    logger.verbose(`${username}[${tag}] logout.`)
    emitter.emit('logout', { tag, username })
  }
}

Object.assign(emitter, {
  setup,
  exit,
  getUserInfos,
  textToUsers,
  sendFileToUsers,
  acceptFile,
  emitter,
  connectServers,
})

module.exports = emitter
