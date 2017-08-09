/* eslint-disable no-param-reassign */

const parseChunks = require('./parseChunks')
const fs = require('fs-extra')
const ensureUnique = require('utils/ensure-unique-filename')
const { EventEmitter } = require('events')
const { resolve } = require('path')

class Parse extends EventEmitter {
  constructor(options) {
    super()
    this.opts = options
    this.socket = options.socket
    this.headCaches = []
    this.bodyLeft = 0
    this.msg = null
    this.writeStream = null
  }

  submitMsg() {
    if (!this.msg) throw Error('message not found')
    this.socket.emit('message', this.msg)
    this.msg = null
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
      const data = buffer.slice(0, this.bodyLeft)
      this.write(data)
      const left = buffer.slice(this.bodyLeft)
      this.bodyLeft = 0
      this.processDone()
      this.transform(left)
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
    const path = ensureUnique(resolve(this.opts.dirname, this.msg.filename))
    fs.ensureFileSync(path) // create stub
    this.msg.filepath = path
    this.socket.emit('message', this.msg) // file msg emit

    // create writeStream
    this.writeStream = fs.createWriteStream(path)
    this.writeStream.checksum = this.msg.checksum
    const self = this
    this.writeStream.once('close', function onclose() {
      self.socket.emit('file-close', this.checksum)
    })
    this.interval = setInterval(this.processing(), 400)
  }

  processing() {
    let lastLeft = this.bodyLeft
    let pass = process.uptime()
    const fn = () => {
      const percent = (this.msg.bodyLength - this.bodyLeft) / this.msg.bodyLength
      const now = process.uptime()
      let speed = (lastLeft - this.bodyLeft) / (now - pass)

      if (speed > 1e6) speed = `${speed / 1e6} MB/s`
      else if (speed > 1e3) speed = `${speed / 1e3} KB/s`
      else speed = `${speed} B/s`

      lastLeft = this.bodyLeft
      pass = now

      this.socket.emit('file-processing', this.msg.checksum, percent, speed)
    }
    return fn
  }

  processDone() {
    // write and emit event
    this.writeStream.end()
    this.writeStream = null
    this.socket.emit('file-done', this.msg.checksum)

    // reset state
    clearInterval(this.interval)
    this.interval = null
    this.msg = null
    this.bodyLeft = 0
  }

  transform(chunk) {
    if (this.bodyLeft <= 0) {
      // receive head first
      const idx = chunk.indexOf('\n')
      if (idx >= 0) this.transformHead(chunk, idx)
      else this.headCaches.push(chunk)
    } else {
      if (this.msg && this.bodyLeft === this.msg.bodyLength) this.processStart()
      this.transformBody(chunk)
    }
  }

  transformHead(chunk, index) {
    const first = chunk.slice(0, index)
    this.headCaches.push(first)
    this.msg = parseChunks(this.headCaches)
    this.headCaches = [] // empty cache
    if (!this.msg) throw Error('fail to parse chunks')

    this.bodyLeft = this.msg.bodyLength || 0
    const notHaveBody = this.bodyLeft === 0

    if (notHaveBody) this.submitMsg()

    /* nothing left */
    if (index + 1 >= chunk.byteLength) return

    const left = chunk.slice(index + 1)
    if (notHaveBody) {
      this.transform(left)
    } else {
      this.processStart()
      this.transformBody(left)
    }
  }
}

module.exports = Parse
