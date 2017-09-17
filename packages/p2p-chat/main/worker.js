const chat = require('p2p-chat-core')
const makePlainError = require('./makePlainError')

const send = (key, ...args) => {
  process.send({
    key,
    args,
  })
}

process.on('uncaughtException', (err) => {
  process.send({ act: 'suicide', error: makePlainError(err) })

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
        send('setup-reply', { error: makePlainError(err), id })
      })
      break
    }
    case 'logout': {
      chat.exit((err) => {
        send('logout-reply', { error: makePlainError(err) })
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
  chat.on(key, (payload, ...rest) => {
    if (payload && typeof payload === 'object' && payload.error) {
      // eslint-disable-next-line no-param-reassign
      payload.error = makePlainError(payload.error)
    }
    send(key, payload, ...rest)
  })
}

bypassChatToMain('logout')
bypassChatToMain('login')

bypassChatToMain('text')
bypassChatToMain('text-sent')
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
