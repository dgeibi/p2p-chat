const logger = require('p2p-chat-logger')
const each = require('p2p-chat-utils/each')
const pickByMap = require('p2p-chat-utils/pickByMap')

const ensureMergeIPset = require('./ensureMergeIPset')
const { connectRange, connectScatter } = require('./connect')
const fileInfoPool = require('./fileInfoPool')
const msgTypes = require('./msgTypes')

module.exports = superClass =>
  class Actions extends superClass {
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

    getOnlineUser() {
      const infos = pickByMap(this.clients, {
        tag: ['info', 'tag'],
        username: ['info', 'username'],
      })
      return infos
    }

    confirmFileReceived(id) {
      this.files.remove(id)
    }

    createChannel(opts) {
      const { payload, tags } = opts
      const message = Object.assign(this.getMessage(), payload)
      message.type = msgTypes.CHANNEL_CREATE

      each(this.clients, tags, (socket) => {
        socket.send(message)
      })
    }

    /**
     * 连接其它服务器
     * @param {setupPayload} opts
     */
    connectServers(opts) {
      if (!this.server.listening) return

      ensureMergeIPset(opts)
      connectRange(opts, this.address)
      connectScatter(opts, this.address)
      this.connectIPset(opts.ipset)
    }
  }
