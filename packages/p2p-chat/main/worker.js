import chat from 'p2p-chat-core'
import makePlainError from './makePlainError'

const postToMain = (key, payload) => {
  process.send({
    key,
    payload,
  })
}

process.on('exit', () => {
  if (chat.active) chat.exit()
})

process.on('uncaughtException', err => {
  process.send({ act: 'suicide', error: makePlainError(err) })

  chat.exit(() => {
    process.exit(1)
  })

  setTimeout(() => {
    process.exit(1)
  }, 5000)
})

process.on('message', message => {
  const { key, payload } = message
  switch (key) {
    case 'change-setting': {
      chat.connectServers(payload)
      break
    }
    case 'setup': {
      chat.setup(payload, (err, id) => {
        postToMain('setup-reply', { error: makePlainError(err), id })
      })
      break
    }
    case 'logout': {
      chat.exit(err => {
        postToMain('logout-reply', { error: makePlainError(err) })
      })
      break
    }
    case 'local-text': {
      chat.textToUsers(payload)
      break
    }
    case 'local-file': {
      chat.sendFileToUsers(payload)
      break
    }
    case 'accept-file': {
      chat.acceptFile(payload)
      break
    }
    case 'create-channel': {
      chat.createChannel(payload)
      break
    }
    default:
      break
  }
})

const C2M = key => {
  chat.on(key, payload => {
    if (payload && typeof payload === 'object' && payload.error) {
      // eslint-disable-next-line no-param-reassign
      payload.error = makePlainError(payload.error)
    }
    postToMain(key, payload)
  })
}

chat.on('error', e => {
  postToMain('chat-error', {
    error: makePlainError(e),
  })
})

C2M('logout')
C2M('login')
C2M('text')
C2M('text-sent')
C2M('fileinfo')
C2M('file-receiced')
C2M('file-receive-fail')
C2M('file-sent')
C2M('file-send-fail')
C2M('file-unable-to-send')
C2M('file-process-start')
C2M('file-processing')
C2M('file-process-done')
C2M('channel-create')
