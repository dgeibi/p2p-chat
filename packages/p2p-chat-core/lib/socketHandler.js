/* eslint-disable no-param-reassign, no-underscore-dangle */
const path = require('path')
const logger = require('p2p-chat-logger')
const has = require('p2p-chat-utils/has')

const each = require('p2p-chat-utils/each')
const IPset = require('p2p-chat-utils/ipset')

const enhanceSocket = require('./enhanceSocket')
const { connectIPset } = require('./connect')
const fileInfoPool = require('./fileInfoPool')
const fileHanderMakers = require('./fileHanderMakers')
const msgTypes = require('./msgTypes')

module.exports = superClass =>
  class SocketHandler extends superClass {
    constructor() {
      super()
      this.messageHandlerMap = {
        [msgTypes.CHANNEL_CREATE]: this.handleChannelCreate,
        [msgTypes.FILE_ACCEPTED]: this.handleFileAccept,
        [msgTypes.TEXT]: this.handleText,
        [msgTypes.FILEINFO]: this.handleFileinfo,
      }
      this.handleSocket = this.handleSocket.bind(this)
      this.handleMessage = this.handleMessage.bind(this)
      const handleLogout = this.handleLogout.bind(this)

      this.socketMixins = {
        logout() {
          handleLogout(this)
        },
      }
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
        mixins: this.socketMixins,
      })

      // 连接服务器后，发送信息
      if (greeting) socket.send(this.getGreetingMsg())

      // 连接出错，进行下线处理
      socket.on('error', socket.logout)

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
      socket.on('end', socket.logout)

      // 处理报文
      socket.on('message', this.handleMessage)
    }

    /**
   * 连接断开/出错，下线
   * @param {{info: {localTag: string, tag: string, username: string}}} socket
   */
    handleLogout(socket) {
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

    connectIPset(ipset) {
      if (!ipset) throw Error('ipset should be passed')
      const { address, port, handleSocket } = this
      ipset.remove(address, port)

      connectIPset(ipset, function handler() {
        handleSocket(this, { greeting: true })
      })
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
