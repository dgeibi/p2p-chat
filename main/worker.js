const chat = require('../chat')
const logger = require('logger')

const send = (key, ...args) => {
  process.send({
    key,
    args,
  })
}

process.on('uncaughtException', (err) => {
  logger.err(err)
  process.send({ act: 'suicide', errMsg: err.message })

  chat.exit(() => {
    process.exit(1)
  })

  setTimeout(() => {
    process.exit(1)
  }, 5000)
})

// front to back
process.on('message', (message) => {
  const { key, args } = message
  switch (key) {
    case 'change-setting': {
      const [opts] = args
      chat.connectServers(opts)
      break
    }
    case 'setup': {
      const [opts] = args
      chat.setup(opts, (err, id) => {
        if (err) logger.err(err, 'setup fail')
        const errMsg = err ? err.message : null
        send('setup-reply', { errMsg, id })
      })
      break
    }
    case 'logout': {
      chat.exit((err) => {
        if (err) logger.err(err, 'exit fail')
        const errMsg = err ? err.message : null
        send('logout-reply', { errMsg })
      })
      break
    }
    case 'local-text': {
      const [{ text, tags }] = args
      chat.textToUsers(tags, text)
      break
    }
    case 'local-file': {
      const [{ filepath, tags }] = args
      chat.sendFileToUsers(tags, filepath)
      break
    }
    case 'accept-file': {
      const [{ tag, checksum }] = args
      chat.acceptFile(tag, checksum)
      break
    }
    default:
      break
  }
})

chat.on('login', ({ tag, username }) => {
  send('people-login', { users: chat.getUserInfos(), tag, username })
})

chat.on('logout', ({ tag, username }) => {
  send('people-logout', { users: chat.getUserInfos(), tag, username })
})

const backToFront = (key) => {
  chat.on(key, (...args) => {
    send(key, ...args)
  })
}

backToFront('text')
backToFront('fileinfo')
backToFront('file-receiced')
backToFront('file-write-fail')
backToFront('file-sent')
backToFront('file-send-fail')
backToFront('file-unable-to-send')
backToFront('file-process-start')
backToFront('file-processing')
backToFront('file-process-done')
