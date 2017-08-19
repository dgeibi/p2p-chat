const chat = require('chat')
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
  const [opts] = args
  switch (key) {
    case 'change-setting': {
      chat.connectServers(opts)
      break
    }
    case 'setup': {
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
      chat.textToUsers(opts)
      break
    }
    case 'local-file': {
      chat.sendFileToUsers(opts)
      break
    }
    case 'accept-file': {
      chat.acceptFile(opts)
      break
    }
    case 'create-channel': {
      chat.createChannel(opts)
      break
    }
    default:
      break
  }
})

const bypassChatToMain = (key) => {
  chat.on(key, (...args) => {
    send(key, ...args)
  })
}

bypassChatToMain('logout')
bypassChatToMain('login')

bypassChatToMain('text')
bypassChatToMain('fileinfo')
bypassChatToMain('file-receiced')
bypassChatToMain('file-receive-fail')
bypassChatToMain('file-sent')
bypassChatToMain('file-send-fail')
bypassChatToMain('file-unable-to-send')
bypassChatToMain('file-process-start')
bypassChatToMain('file-processing')
bypassChatToMain('file-process-done')
bypassChatToMain('channel-create')
