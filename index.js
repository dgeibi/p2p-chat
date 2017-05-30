/* eslint-disable no-param-reassign */
const net = require('net');
const fs = require('fs-extra');
const path = require('path');
const EventEmitter = require('events');

const events = new EventEmitter();

const checkProps = require('./lib/utils/checkProps');
const connect = require('./lib/connect');
const getNewHost = require('./lib/utils/getNewHost');
const parseChunks = require('./lib/utils/parseChunks');
const isIPLarger = require('./lib/utils/isIPLarger');

const login = require('./lib/login');
const send = require('./lib/send');
const { loadFile, loadFileInfo } = require('./lib/file');

const local = {
  active: false,
};
const clients = {};

const getMessage = () => ({
  username: local.username,
  tag: local.tag,
});

const handleSocket = (socket, opts = {}) => {
  const { reGreeting } = opts;

  socket.on('error', () => {
    if (socket.tag) delete clients[socket.tag];
  });

  socket.once('data', (greetingChunk) => {
    const session = parseChunks([greetingChunk]);
    if (!session || session.type !== 'greeting') return;
    console.log(`${session.username}[${session.tag}] login.`);

    // 添加信息
    socket.username = session.username;
    socket.tag = session.tag;
    clients[session.tag] = socket;

    events.emit('login', session.tag, session.username);

    // response id
    if (reGreeting) {
      send(socket, {
        type: 'greeting',
        tag: local.tag,
        username: local.username,
      });
    }

    socket.on('end', () => {
      delete clients[session.tag];
      // console.log(`${session.username}[${session.tag}] logout.`);
      events.emit('logout', session.tag, session.username);
    });

    const caches = [];
    socket.on('data', (chunk) => {
      caches.push(chunk); // 缓存
      const message = parseChunks(caches); // 尝试取出报文
      if (!message) return; // 无法取出
      caches.splice(0, caches.length); // 清空缓存

      // 处理报文
      const { tag, type, data, filename, checksum, text, username } = message;
      switch (type) {
        case 'file': {
          // receive and write file
          const filepath = path.resolve('download', local.username, filename);
          fs.outputFile(filepath, data, (err) => {
            if (err) {
              console.log(`${filename} 写入失败`);
              events.emit('file-write-fail', { tag, username, filename });
            } else {
              events.emit('file-receiced', { tag, username, filename, filepath });
            }
          });
          break;
        }
        case 'fileinfo': {
          events.emit('fileinfo', message);
          break;
        }
        case 'text': {
          events.emit('text', tag, username, text);
          break;
        }
        case 'file-accepted': {
          // emit file
          const fileMsg = loadFile(checksum);
          send(clients[tag], fileMsg);
          events.emit('file-accepted', tag, username, loadFile(checksum).filename, checksum);
          break;
        }
        default:
          break;
      }
    });
  });
};

function setup(options, callback) {
  if (local.active) {
    exit((err) => {
      if (!err) setup(options, callback);
      else callback(err);
    });
    return;
  }
  const opts = {
    username: 'anonymous',
    port: 8087,
    host: '127.0.0.1',
    from: '127.0.0.1',
    to: '127.0.0.10',
  };
  Object.assign(opts, options);
  const wrongs = checkProps(opts, {
    username: { type: 'string' },
    port: { type: 'number' },
    host: { type: 'string' },
  });
  if (wrongs.length > 0) {
    callback(wrongs[0]);
  }

  login(opts, (error, id) => {
    if (error) throw error;
    Object.assign(local, id);
    const { host, port, username, tag } = id;
    // 1. create server, sending data
    const server = net.createServer((socket) => {
      handleSocket(socket, { reGreeting: true });
    });

    local.server = server;

    server.on('error', (err) => {
      throw err;
    });

    // 2. start listening
    server.listen(port, host, () => {
      console.log('>> opened server on', server.address());
      console.log(`>> Hi! ${username}[${tag}]`);

      if (opts.from && opts.to) {
        connectRange(opts.from, opts.to);
      }
      // 3. connect to other clients
      local.active = true;
      callback(null, tag);
    });
  });
}

function connectRange(from, to) {
  if (isIPLarger(from, to)) return; // 超过范围
  if (local.host !== from) {
    connect({
      host: from,
      port: local.port,
      localAddress: local.host,
      localPort: local.port,
      tag: local.tag,
      username: local.username,
    }, (e, socket) => {
      if (!e) {
        handleSocket(socket);
      }
    });
  }
  connectRange(getNewHost(from), to);
}

function getUserInfos() {
  return Object.keys(clients).map(tag => ({
    tag,
    username: clients[tag].username,
  }));
}

function textToUsers(tags, text) {
  tags.forEach((tag) => {
    const message = getMessage();
    message.type = 'text';
    message.text = text;
    send(clients[tag], message);
  });
}

function sendFileToUsers(tags, filepath) {
  tags.forEach((tag) => {
    const message = getMessage();
    loadFileInfo(filepath, message);
    send(clients[tag], message);
  });
}

function allClients(fn) {
  Object.keys(clients).forEach((tag) => {
    fn(clients[tag]);
  });
}

function acceptFile(tag, checksum) {
  const message = getMessage();
  message.type = 'file-accepted';
  message.checksum = checksum;
  send(clients[tag], message);
}

function exit(callback) {
  if (local.active) {
    allClients((client) => {
      client.destroy();
    });
    local.server.close(() => {
      local.active = false;
      console.log(`>> Bye! ${local.username}[${local.tag}]`);
      callback();
    });
  } else {
    callback();
  }
}

module.exports = {
  setup,
  exit,
  getUserInfos,
  textToUsers,
  sendFileToUsers,
  acceptFile,
  events,
};
