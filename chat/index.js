/* eslint-disable no-param-reassign, no-continue */
const net = require('net')
const path = require('path')
const EventEmitter = require('events')

const emitter = new EventEmitter()
module.exports = emitter

const logger = require('logger')

const enhanceSocket = require('./lib/enhanceSocket')
const md5 = require('./lib/utils/md5')
const getNewHost = require('./lib/utils/getNewHost')
const isIPLarger = require('./lib/utils/isIPLarger')

const ipSet = require('./lib/ipSet')
const login = require('./lib/login')
const fileModule = require('./lib/file')

const locals = {
  active: false,
  clients: null,
  port: null,
  address: null,
  tag: null,
  username: null,
}

// 已经确认接收的文件
const fileAccepted = {}

const getMessage = () => ({
  type: 'greeting',
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
  const { reGreeting, greeting } = opts

  enhanceSocket({
    socket,
    parse: true,
    dirname: path.resolve('Downloads', locals.username),
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
    if (locals.clients[tag] && session.type === 'file' && fileAccepted[session.checksum]) {
      handleFile(socket, session)
      return
    }

    // 不符合预期的报文，或者重复连接 -> 断开连接
    if (session.type !== 'greeting' || locals.clients[tag]) {
      socket.end()
      return
    }

    // 添加信息
    socket.info = Object.assign({ localTag: locals.tag }, session)
    // 存入 local.clients
    locals.clients[tag] = socket

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
      const { type, checksum, text, channel } = message
      switch (type) {
        case 'fileinfo': {
          message.id = `${checksum}.${process.uptime()}`
          emitter.emit('fileinfo', message)
          break
        }
        case 'text': {
          emitter.emit('text', { tag, username, text, channel })
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
                emitter.emit('file-send-fail', {
                  tag,
                  username,
                  filename,
                  checksum,
                  channel,
                  errMsg,
                })
              } else {
                emitter.emit('file-sent', { tag, username, filename, checksum, channel })
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
  if (locals.active) {
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
    Object.assign(locals, id)
    locals.clients = {}

    const { host, port, username, tag } = id
    // 1. create server, sending data
    const server = net.createServer((socket) => {
      handleSocket(socket, { reGreeting: true })
    })

    // 2. start listening
    server.listen({ port, host }, () => {
      locals.server = server
      logger.verbose('>> opened server on', server.address())
      logger.verbose(`>> Hi! ${username}[${tag}]`)

      // 3. connect to other servers
      connectServers(opts)
      locals.active = true
      callback(null, id)
    })
  })
}

/**
 * 连接其它服务器
 * @param {setupOpts} opts
 */
function connectServers(opts) {
  if (!locals.server.listening) return
  if (!opts.ipset) opts.ipset = ipSet()
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
  opts.ipset.forEach((host, port) => {
    if (!(port === locals.port && host === locals.address)) {
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
function getUserInfos() {
  const infos = pick(locals.clients, {
    tag: ['info', 'tag'],
    username: ['info', 'username'],
  })
  return infos
}

function getValue(object, props) {
  if (!object) return null
  if (!Array.isArray(props)) return object[props]
  const [first, ...rest] = props
  if (!first) return object
  return getValue(object[first], rest)
}

function pick(object, props, keys) {
  if (!keys) keys = Object.keys(object)
  return keys.reduce((obj, key) => {
    const value = object[key]
    if (!value) return obj
    obj[key] = {}
    Object.keys(props).forEach((propKey) => {
      obj[key][propKey] = getValue(object[key], props[propKey])
    })
    return obj
  }, {})
}

function getUserFullInfos(tags) {
  return pick(
    locals.clients,
    {
      tag: ['info', 'tag'],
      host: ['info', 'host'],
      port: ['info', 'port'],
    },
    tags
  )
}

/**
 * 发送文本
 * @param {Array<string>} tags
 * @param {string} text
 */
function textToUsers({ tags, text, channel }) {
  const message = getMessage()
  message.type = 'text'
  message.text = text
  message.channel = channel

  eachSocket(tags, (socket) => {
    socket.send(message)
  })
}

/**
 * 发送文件
 * @param {Array<string>} tags
 * @param {string} filepath
 */
function sendFileToUsers({ tags, filepath, channel }) {
  fileModule.getInfoMsg(filepath, getMessage(), (err, message) => {
    if (err) {
      logger.err(err)
      emitter.emit('file-unable-to-send', { errMsg: err.message, channel })
      return
    }
    message.channel = channel
    eachSocket(tags, (socket) => {
      socket.send(message)
    })
  })
}

/**
 * 对所有的连接执行 fn
 * @param {function(object)} fn
 */
function allClients(fn) {
  Object.keys(locals.clients).forEach((tag) => {
    fn(locals.clients[tag])
  })
}

// 同意接收文件
function acceptFile({ tag, checksum, channel }) {
  const socket = locals.clients[tag]
  if (socket) {
    const message = getMessage()
    message.type = 'file-accepted'
    message.checksum = checksum
    message.channel = channel
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
    allClients((client) => {
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
    delete locals.clients[tag]
    logger.verbose(`${username}[${tag}] logout.`)
    emitter.emit('logout', { tag, username })
  }
}

function createChannel({ tags, channelName }) {
  const channel = md5.dataSync(channelName + locals.address + locals.port + Math.random())
  const message = getMessage()
  message.type = 'channel'
  message.channel = channel
  message.users = getUserFullInfos(tags)

  eachSocket(tags, (socket) => {
    socket.send(message)
  })
}

function eachSocket(tags, callback) {
  tags.forEach((tag) => {
    const socket = locals.clients[tag]
    if (socket) {
      callback(socket)
    }
  })
}

Object.assign(emitter, {
  locals,
  setup,
  exit,
  getUserInfos,
  textToUsers,
  sendFileToUsers,
  acceptFile,
  emitter,
  connectServers,
})
