const chat = require('../chat');
const logger = require('logger');

const send = (key, ...args) => {
  process.send({
    key,
    args,
  });
};

process.on('uncaughtException', (err) => {
  logger.err(err);
  process.send({ act: 'suicide', errMsg: err.message });

  chat.exit(() => {
    process.exit(1);
  });

  setTimeout(() => {
    process.exit(1);
  }, 5000);
});

// front to back
process.on('message', (message) => {
  const { key, args } = message;
  switch (key) {
    case 'change-setting': {
      const [opts] = args;
      chat.connectServers(opts);
      break;
    }
    case 'setup': {
      const [opts] = args;
      chat.setup(opts, (err, id) => {
        if (err) logger.err(err, 'setup fail');
        send('setup-reply', err ? err.message : null, id);
      });
      break;
    }
    case 'logout': {
      chat.exit((err) => {
        if (err) logger.err(err, 'exit fail');
        send('logout-reply', err ? err.message : null);
      });
      break;
    }
    case 'local-text': {
      chat.textToUsers(...args);
      break;
    }
    case 'local-file': {
      chat.sendFileToUsers(...args);
      break;
    }
    case 'accept-file': {
      chat.acceptFile(...args);
      break;
    }
    default:
      break;
  }
});

chat.on('login', (tag, username) => {
  send('people-login', chat.getUserInfos(), tag, username);
});

chat.on('logout', (tag, username) => {
  send('people-logout', chat.getUserInfos(), tag, username);
});

const backToFront = (key) => {
  chat.on(key, (...args) => {
    send(key, ...args);
  });
};

backToFront('text');
backToFront('fileinfo');
backToFront('file-receiced');
backToFront('file-write-fail');
backToFront('file-sent');
backToFront('file-send-fail');
backToFront('file-process-start');
backToFront('file-processing');
backToFront('file-process-done');
