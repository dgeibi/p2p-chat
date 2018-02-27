/* eslint-disable no-param-reassign, no-underscore-dangle */

const parseChunks = require('p2p-chat-utils/parse-chunks')
const ensureUniqueFile = require('p2p-chat-utils/ensure-unique-file')
const { createWriteStream } = require('fs')
const { EventEmitter } = require('events')
const { resolve } = require('path')

class Parse extends EventEmitter {
  /**
   * @param {Object} options
   * @param {net.Socket} options.socket
   * @param {string} [options.delimiter]
   * @param {Object} [options.speedMeter]
   * @param {number} [options.speedMeter.gap]
   * @param {boolean} [options.speedMeter.enable]
   */
  constructor(options) {
    super()
    this.opts = Object.assign(
      {
        delimiter: '\n',
        speedMeter: {
          gap: 400,
          enable: true,
        },
      },
      options
    )
    this.socket = options.socket
    this.headCaches = []
    this.resetState()
  }

  resetState() {
    this.writeStream = null
    this.interval = null
    this.msg = null
    this.bodyLeft = 0
  }

  emitError(error) {
    this.socket.emit('error', error)
  }

  submitMsg(reset = true) {
    if (!this.msg) {
      this.emitError(Error('message not found'))
      return
    }
    this.socket.emit('message', this.msg)
    if (reset) this.msg = null
  }

  write(data) {
    if (!this.writeStream.write(data)) {
      this.socket.pause()
      this.writeStream.once('drain', () => {
        this.socket.resume()
      })
    }
  }

  transformBody(buffer) {
    if (buffer.byteLength > this.bodyLeft) {
      // has head start
      const pos = this.bodyLeft
      this.write(buffer.slice(0, pos))
      this.processDone()
      this.transform(buffer.slice(pos))
    } else {
      // cache the whole buffer
      this.write(buffer)
      this.bodyLeft -= buffer.byteLength
      if (this.bodyLeft === 0) {
        this.processDone()
      }
    }
  }

  processStart() {
    try {
      const pathname = ensureUniqueFile(resolve(this.opts.dirname, this.msg.filename))
      this.submitFileMsg(pathname)
      this.createWriteStream(pathname)
      this.openSpeedMeter()
    } catch (e) {
      this.emitError(e)
    }
  }

  createWriteStream(pathname) {
    const { socket, msg: { checksum } } = this
    const writeStream = createWriteStream(pathname)
    writeStream.once('close', () => {
      socket.emit('file-close', checksum)
    })
    writeStream.on('error', e => {
      socket.emit('error', e)
    })
    this.writeStream = writeStream
  }

  submitFileMsg(pathname) {
    this.msg.filepath = pathname
    this.submitMsg(false)
  }

  openSpeedMeter() {
    if (!this.opts.speedMeter || !this.opts.speedMeter.enable) return
    this.interval = setInterval(this.processing(), this.opts.speedMeter.gap)
  }

  closeSpeedMeter() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  processing() {
    let lastLeft = this.bodyLeft
    let pass = process.uptime()
    const fn = () => {
      const now = process.uptime()
      const { bodyLeft, msg: { bodyLength, checksum } } = this

      const percent = (bodyLength - bodyLeft) / bodyLength
      const speed = (lastLeft - bodyLeft) / (now - pass)

      lastLeft = bodyLeft
      pass = now

      this.socket.emit('file-processing', checksum, percent, speed)
    }
    return fn
  }

  processDone() {
    // write and emit event
    this.writeStream.end()
    this.socket.emit('file-done', this.msg.checksum)

    // reset state
    this.closeSpeedMeter()
    this.resetState()
  }

  transform(chunk) {
    if (this.bodyLeft <= 0) {
      // receive head first
      const idx = chunk.indexOf(this.opts.delimiter)
      if (idx >= 0) this.transformHead(chunk, idx)
      else this.headCaches.push(chunk)
    } else {
      if (this.msg && this.bodyLeft === this.msg.bodyLength) this.processStart()
      this.transformBody(chunk)
    }
  }

  transformHead(chunk, index) {
    const headData = chunk.slice(0, index)
    this.headCaches.push(headData)
    this.msg = parseChunks(this.headCaches)
    if (!this.msg) {
      this.emitError(Error('fail to parse chunks'))
      return
    }

    this.headCaches = [] // empty cache
    this.bodyLeft = this.msg.bodyLength || 0

    const isPlainMsg = this.bodyLeft === 0
    if (isPlainMsg) this.submitMsg()

    const startPos = index + this.opts.delimiter.length
    const left = startPos < chunk.byteLength ? chunk.slice(startPos) : null

    if (left) this.transformHeadLeft(left, isPlainMsg)
  }

  transformHeadLeft(chunk, isPlainMsg) {
    if (isPlainMsg) {
      this.transform(chunk)
    } else {
      this.processStart()
      this.transformBody(chunk)
    }
  }

  destory() {
    this.closeSpeedMeter()
    if (this.writeStream) {
      this.writeStream.removeAllListeners()
      this.writeStream.destroy()
    }
  }
}

module.exports = Parse
