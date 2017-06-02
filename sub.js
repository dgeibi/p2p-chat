const chat = require('./core');

const send = (key, ...args) => {
  process.send({
    key,
    args,
  });
};

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
        if (err) console.log(err);
        send('setup-reply', err ? err.message : null, id);
      });
      break;
    }
    case 'logout': {
      chat.exit((err) => {
        if (err) console.log(err);
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


chat.events.on('login', (tag, username) => {
  send('people-login', chat.getUserInfos(), tag, username);
});

chat.events.on('logout', (tag, username) => {
  send('people-logout', chat.getUserInfos(), tag, username);
});

const backToFront = (key) => {
  chat.events.on(key, (...args) => {
    send(key, ...args);
  });
};

backToFront('text');
backToFront('fileinfo');
backToFront('file-receiced');
backToFront('file-write-fail');
backToFront('file-accepted');
