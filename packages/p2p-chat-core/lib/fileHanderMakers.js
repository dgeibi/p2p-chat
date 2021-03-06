const logger = require('p2p-chat-logger')

const fileReceiveError = ({
  chat,
  error,
  info: { id, tag, username, filename, channel },
}) => {
  chat.emit('file-receive-fail', {
    tag,
    error,
    channel,
    username,
    filename,
    id,
  })
}

const fileReceived = ({
  chat,
  info: { tag, username, filename, filepath, id, channel },
}) => {
  chat.emit('file-receiced', {
    tag,
    username,
    filename,
    filepath,
    id,
    channel,
  })
}

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
  const done = currentChecksum => {
    if (currentChecksum !== checksum) return
    socket.removeListener('file-processing', processing)
    socket.removeListener('file-done', done)
    chat.emit('file-process-done', { id, tag, channel })
  }
  return done
}

const makeClose = (chat, socket, info) => {
  const { checksum, filepath, filename, id } = info
  const close = (currentChecksum, realChecksum) => {
    if (currentChecksum !== checksum) return
    socket.removeListener('file-close', close)
    if (realChecksum !== checksum) {
      const error = Error(`\`${filename}\` validation fail`)
      fileReceiveError({
        chat,
        error,
        info,
      })
    } else {
      fileReceived({
        chat,
        info,
      })
      logger.verbose('file receiced', filepath)
      chat.confirmFileReceived(id)
    }
  }
  return close
}

module.exports = { makeClose, makeDone, makeProcessing, fileReceiveError, fileReceived }
