/* eslint-disable no-param-reassign, no-underscore-dangle */
const path = require('path')
const logger = require('p2p-chat-logger')
const has = require('p2p-chat-utils/has')
const { EventEmitter } = require('events')

const each = require('p2p-chat-utils/each')
const pickByMap = require('p2p-chat-utils/pickByMap')
const IPset = require('p2p-chat-utils/ipset')

const enhanceSocket = require('./enhanceSocket')
const { connectIPset } = require('./connect')
const fileInfoPool = require('./fileInfoPool')
const fileHanderMakers = require('./fileHanderMakers')
const Store = require('./Store')

const msgTypes = {
  CHANNEL_CREATE: 'channel-create',
  FILE_ACCEPTED: 'file-accepted',
  TEXT: 'text',
  FILEINFO: 'fileinfo',
  FILE: 'file',
  GREETING: 'greeting',
  GREETING_REPLY: 'greeting-reply',
}
module.exports = class SocketHandler extends EventEmitter {
  constructor() {
    super()
    this.messageHandlerMap = {
      [msgTypes.CHANNEL_CREATE]: this.handleChannelCreate,
      [msgTypes.FILE_ACCEPTED]: this.handleFileAccept,
      [msgTypes.TEXT]: this.handleText,
      [msgTypes.FILEINFO]: this.handleFileinfo,
    }
    this.files = new Store()
    this.handleSocket = this.handleSocket.bind(this)
    this.handleMessage = this.handleMessage.bind(this)
    this.handleConnectSocket = this.handleConnectSocket.bind(this)
  }

  /**
   * @param {net.Socket} socket
   * @param {{greeting: boolean, reGreeting: boolean}} opts
   */
  handleSocket(socket, opts = {}) {
    const { greeting } = opts

    enhanceSocket({
      socket,
      parse: true,
      dirname: path.resolve(this.downloadDir, this.username),
    })

    // 连接服务器后，发送信息
    if (greeting) socket.send(this.getGreetingMsg())

    // 连接出错，进行下线处理
    socket.on('error', () => {
      this.peopleLogout(socket)
    })

    // 收到第一个报文，一个会话开始
    socket.once('message', (session) => {
      const { tag, type } = session

      // 对发送文件的socket特殊处理
      if (
        this.clients[tag] &&
        session.type === msgTypes.FILE &&
        this.files.has(session.id)
      ) {
        this.handleFileSocket(socket, session)
        return
      }

      if (
        (type !== msgTypes.GREETING && type !== msgTypes.GREETING_REPLY) ||
        this.clients[tag]
      ) {
        socket.destroy()
        return
      }

      // 回复信息
      const msg = this.getMessage()
      msg.type = msgTypes.GREETING_REPLY
      socket.send(msg)

      if (type === msgTypes.GREETING) {
        this._waitReply(socket, session)
      } else {
        this._bindSocket(socket, session)
      }
    })
  }

  handleFileSocket(socket, message) {
    const { id, tag, username, filepath, channel, size } = message
    const filename = path.basename(filepath)
    message.filename = filename
    this.emit('file-process-start', {
      id,
      tag,
      channel,
      size,
      filename,
      username,
    })

    const processing = fileHanderMakers.makeProcessing(this, message)
    const done = fileHanderMakers.makeDone(this, socket, message, { processing })
    const close = fileHanderMakers.makeClose(this, socket, message)

    socket.on('file-processing', processing)
    socket.on('file-done', done)
    socket.on('file-close', close)
  }

  _waitReply(socket, preSession) {
    socket.once('message', (session) => {
      const { type, tag } = session
      if (type !== msgTypes.GREETING_REPLY || preSession.tag !== tag) {
        socket.destroy()
        return
      }
      this._bindSocket(socket, session)
    })
  }

  _bindSocket(socket, session) {
    const { username, tag } = session

    // 添加信息，存入 clients
    socket.info = Object.assign({ localTag: this.tag }, session)

    // 已登录的提示
    if (!this.clients[tag]) {
      logger.verbose(`${username}[${tag}] login.`)
      this.emit('login', session)
    }
    this.clients[tag] = socket

    // 连接断开后，进行一些处理
    socket.on('end', () => {
      this.peopleLogout(socket)
    })

    // 处理报文
    socket.on('message', this.handleMessage)
  }

  getOnlineUser() {
    const infos = pickByMap(this.clients, {
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
  textToUsers(opts) {
    const { tags, payload } = opts
    const message = Object.assign(this.getMessage(), payload)
    message.type = msgTypes.TEXT
    each(this.clients, tags, (socket) => {
      socket.send(message)
    })
    this.emit('text-sent', Object.assign({ tag: tags[0] }, payload))
  }

  /**
   * 发送文件
   * @param {Array<string>} tags
   * @param {string} filepath
   */
  sendFileToUsers(opts) {
    const { tags, filepath, payload } = opts
    const msg = Object.assign(this.getMessage(), payload)

    fileInfoPool.getInfoMsg(filepath, msg, (error, message) => {
      if (error) {
        logger.err('file-unable-to-send', error)
        this.emit('file-unable-to-send', { error })
        return
      }
      each(this.clients, tags, (socket) => {
        socket.send(message)
      })
    })
  }

  // 同意接收文件
  acceptFile(opts) {
    const { tag, payload } = opts
    const { id } = payload
    const socket = this.clients[tag]
    if (socket) {
      const message = Object.assign(this.getMessage(), payload)
      message.type = msgTypes.FILE_ACCEPTED
      this.files.add(id)
      socket.send(message)
    }
  }

  confirmFileReceived(id) {
    this.files.remove(id)
  }

  /**
   * 连接断开/出错，下线
   * @param {{info: {localTag: string, tag: string, username: string}}} socket
   */
  peopleLogout(socket) {
    const { username, tag, localTag } = socket.info || {}
    if (localTag === this.tag) {
      if (this.clients[tag] && this.clients[tag].destroyed === false) {
        this.clients[tag].destroy()
      }
      this.clients[tag] = undefined
      logger.verbose(`${username}[${tag}] logout.`)
      this.emit('logout', { tag, username })
    }
  }

  createChannel(opts) {
    const { payload, tags } = opts
    const message = Object.assign(this.getMessage(), payload)
    message.type = msgTypes.CHANNEL_CREATE

    each(this.clients, tags, (socket) => {
      socket.send(message)
    })
  }

  handleMessage(message) {
    if (has(this.messageHandlerMap, message.type)) {
      const handler = this.messageHandlerMap[message.type]
      handler.call(this, message)
    }
  }

  handleFileAccept(message) {
    const { checksum, port, host, id } = message
    fileInfoPool.send(checksum, { id }, { port, host }, (error, filename) => {
      const payload = Object.assign({}, message)
      payload.filename = filename

      if (error) {
        payload.error = error
        logger.err('file-send-fail', filename, error.message)
        this.emit('file-send-fail', payload)
      } else {
        this.emit('file-sent', payload)
      }
    })
  }

  handleChannelCreate({ tag, key, channel }) {
    this.emit('channel-create', { tag, key, channel })
    const ipset = IPset()
    each(channel.users, ({ host, port }) => {
      ipset.add(host, port)
    })
    each(this.clients, ({ info: { host, port } }) => {
      ipset.remove(host, port)
    })
    this.connectIPset(ipset)
  }

  handleText(message) {
    this.emit('text', message)
  }

  handleFileinfo(message) {
    message.id = `${message.checksum}?${Date.now()}`
    this.emit('fileinfo', message)
  }

  handleConnectSocket(socket) {
    this.handleSocket(socket, { greeting: true })
  }

  connectIPset(ipset) {
    ipset.remove(this.address, this.port)
    connectIPset(ipset, this.handleConnectSocket)
  }

  getGreetingMsg() {
    const msg = this.getMessage()
    msg.type = msgTypes.GREETING
    return msg
  }

  getMessage() {
    return {
      host: this.address,
      port: this.port,
      username: this.username,
      tag: this.tag,
    }
  }
}
