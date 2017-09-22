const fs = require('fs')
const path = require('path')
const net = require('net')

const md5 = require('p2p-chat-utils/md5')
const enhanceSocket = require('./enhanceSocket')

const messages = {}

/**
 * Get `fileinfo` message
 * @param {string} filepath - full file path
 * @param {object} message - message template
 * @param {function(Error, object)} callback
 */
function getInfoMsg(filepath, message, callback) {
  fs.stat(filepath, (err, stats) => {
    if (err || !stats.isFile()) {
      callback(Error(`${filepath} is not a file`))
      return
    }
    const { size } = stats
    if (size === 0) {
      callback(Error(`${filepath} is empty file`))
      return
    }
    md5.file(filepath, false, (md5Error, checksum) => {
      if (md5Error) {
        callback(md5Error)
        return
      }
      const filename = path.basename(filepath)
      const fileInfoMessage = Object.assign(message, {
        type: 'fileinfo',
        filename,
        checksum,
        size,
      })
      messages[checksum] = Object.assign({}, message, {
        filepath,
        type: 'file',
      })
      callback(null, fileInfoMessage)
    })
  })
}

/**
 * 发送文件
 * @param {string} checksum
 * @param {object} options connect options
 * @param {function(?Error, ?string)} callback
 */
function send(checksum, payload, options, callback) {
  if (!messages[checksum]) {
    callback(Error(`file not loaded from ${checksum}`))
    return
  }
  const fileMsg = Object.assign({}, payload, messages[checksum])
  const { filepath, filename } = fileMsg
  fs.stat(filepath, (err) => {
    if (err) {
      callback(Error(`fail to read file ${filepath}`), filename)
      return
    }
    delete fileMsg.filepath
    const socket = net
      .connect(options, () => {
        enhanceSocket({ socket })
        fileMsg.bodyLength = fileMsg.size
        socket.send(fileMsg)
        const readStream = fs.createReadStream(filepath)
        readStream.pipe(socket)
        readStream.once('end', () => {
          socket.end()
          socket.once('close', () => {
            callback(null, filename)
          })
        })
      })
      .on('error', (e) => {
        callback(e, filename)
      })
  })
}

module.exports = {
  getInfoMsg,
  send,
}
