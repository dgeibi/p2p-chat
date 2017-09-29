const logger = require('p2p-chat-logger')
const md5 = require('p2p-chat-utils/md5')

/**
 * 校验、写入文件
 * @param {object} message
 */

const makeProcessing = (chat, { checksum, tag, channel, id }) => (
  currentChecksum,
  percent,
  speed
) => {
  if (currentChecksum !== checksum) return
  chat.emit('file-processing', {
    tag,
    channel,
    id,
    percent,
    speed,
  })
}

const makeDone = (chat, socket, { checksum, id, tag, channel }, { processing }) => {
  const done = (currentChecksum) => {
    if (currentChecksum !== checksum) return
    socket.removeListener('file-processing', processing)
    socket.removeListener('file-done', done)
    chat.emit('file-process-done', { id, tag, channel })
  }
  return done
}

const makeClose = (
  chat,
  socket,
  { id, checksum, tag, username, filename, filepath, channel }
) => {
  const close = (currentChecksum) => {
    if (currentChecksum !== checksum) return
    socket.removeListener('file-close', close)
    md5.file(filepath, false, (md5Err, realChecksum) => {
      // 检查checksum
      if (md5Err || realChecksum !== checksum) {
        const error = md5Err || Error(`\`${filename}\` validation fail`)
        chat.emit('file-receive-fail', {
          tag,
          error,
          channel,
          username,
          filename,
          id,
        })
        return
      }
      chat.emit('file-receiced', {
        tag,
        username,
        filename,
        filepath,
        id,
        channel,
      })
      logger.verbose('file receiced', filepath)
      chat.confirmFileReceived(id)
    })
  }
  return close
}

module.exports = { makeClose, makeDone, makeProcessing }
