/* eslint-disable no-param-reassign, no-continue */
const net = require('net');
const fs = require('fs-extra');
const path = require('path');
const EventEmitter = require('events');
const { EOL } = require('os');

const events = new EventEmitter();

const getChecksum = require('./lib/utils/getChecksum');
const getNewHost = require('./lib/utils/getNewHost');
const parseChunks = require('./lib/utils/parseChunks');
const isIPLarger = require('./lib/utils/isIPLarger');

const login = require('./lib/login');
const send = require('./lib/send');
const sendFile = require('./lib/sendFile');

const connect = require('./lib/tryConnect').bind(null, handleSocket);
const { loadFile, loadFileInfo } = require('./lib/file');

const local = {
  active: false,
};
const clients = {};

// 已经确认接收的文件
const fileAccepted = {};

const getMessage = () => ({
  host: local.host,
  port: local.port,
  username: local.username,
  tag: local.tag,
});

function handleFileSocket(socket, message, firstChunk) {
  const fileChunkCaches = [firstChunk];
  socket.on('data', (chunk) => {
    fileChunkCaches.push(chunk);
  });
  socket.on('end', () => {
    console.log('end');
    const data = Buffer.concat(fileChunkCaches);
    const { filename, username, tag } = message;
    const realChecksum = getChecksum(data);
    // 检查checksum
    if (!fileAccepted[realChecksum] || realChecksum !== message.checksum) return;

    const filepath = path.resolve('download', local.username, filename);
    fs.outputFile(filepath, data, (err) => {
      if (err) {
        console.log(`${filename} 写入失败`);
        events.emit('file-write-fail', { tag, username, filename });
      } else {
        events.emit('file-receiced', { tag, username, filename, filepath });
      }
    });
    fileAccepted[realChecksum] = false;
  });
}

function handleSocket(socket, opts = {}) {
  const { reGreeting } = opts;

  socket.on('error', () => {
    if (socket.tag) delete clients[socket.tag];
  }).once('data', (firstChunk) => {
    // 对发送文件的socket特殊处理
    const eolPos = firstChunk.indexOf(EOL);
    if (eolPos > 0) {
      const message = parseChunks([firstChunk.slice(0, eolPos)]);
      if (!message) return; // 无效的报文
      const chunk = firstChunk.slice(eolPos + EOL.length);
      // 已经登录, 报文类型是 fileinfo, 已经确认接收
      if (clients[message.tag] && message.type === 'fileinfo' && fileAccepted[message.checksum]) {
        handleFileSocket(socket, message, chunk);
        return;
      }
    }

    const session = parseChunks([firstChunk]);

    // 不符合预期的报文，断开连接
    if (!session || session.type !== 'greeting' || clients[session.tag]) {
      socket.end();
      return;
    }

    // 添加信息
    socket.username = session.username;
    socket.tag = session.tag;
    clients[session.tag] = socket;

    console.log(`${session.username}[${session.tag}] login.`);
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
      console.log(`${session.username}[${session.tag}] logout.`);
      events.emit('logout', session.tag, session.username);
    });

    const caches = [];
    socket.on('data', (chunk) => {
      caches.push(chunk); // 缓存
      const message = parseChunks(caches); // 尝试取出报文
      if (!message) return; // 无法取出
      caches.splice(0, caches.length); // 清空缓存

      // 处理报文
      const { tag, type, checksum, text, username } = message;
      switch (type) {
        case 'fileinfo': {
          events.emit('fileinfo', message);
          break;
        }
        case 'text': {
          events.emit('text', tag, username, text);
          break;
        }
        case 'file-accepted': {
          const file = loadFile(checksum);
          sendFile(
            file.data,
            {
              port: message.port,
              host: message.host,
            },
            (e) => {
              if (e) {
                console.error(e);
                events.emit('file-send-fail', tag, username, file.filename, checksum, e.message);
              } else {
                events.emit('file-sent', tag, username, file.filename, checksum);
              }
            });
          break;
        }
        default:
          break;
      }
    });
  });
}

const defaultOpts = {
  username: 'anonymous',
  port: 8087,
};

function setup(options, callback) {
  if (local.active) {
    exit((err) => {
      if (!err) setup(options, callback);
      else callback(err);
    });
    return;
  }

  const opts = Object.assign({}, defaultOpts, options);
  opts.port = parseInt(opts.port, 10);
  if (isNaN(opts.port) || opts.port < 2000 || opts.port > 59999) {
    callback(TypeError('port should be a integer (2000~59999)'));
    return;
  }
  if (typeof opts.username !== 'string') {
    callback(TypeError('username should be a string'));
    return;
  }

  login(opts, (error, id) => {
    if (error) {
      callback(error);
      return;
    }
    Object.assign(local, id);
    const { host, port, username, tag } = id;
    // 1. create server, sending data
    const server = net.createServer((socket) => {
      handleSocket(socket, { reGreeting: true });
    });

    server.on('error', (err) => {
      throw err;
    });

    // 2. start listening
    server.listen({ port, host }, () => {
      local.server = server;
      console.log('>> opened server on', server.address());
      console.log(`>> Hi! ${username}[${tag}]`);

      // 3. connect to other servers
      connectServers(opts);
      local.active = true;
      callback(null, id);
    });
  });
}

function connectServers(opts) {
  if (!local.server.listening) return;
  connectRange(opts);

  if (opts.connects) {
    opts.connects.forEach((conn) => {
      connect({
        host: conn.host || (local.host || local.address),
        port: conn.port,
        localAddress: local.host,
        tag: local.tag,
        username: local.username,
      });
    });
    delete opts.connects;
  }
}

function connectHostRange(from, to, port) {
  if (isIPLarger(from, to)) return; // 超过范围
  if (port !== local.port || from !== (local.host || local.address)) {
    connect({
      host: from,
      port,
      localAddress: local.host,
      tag: local.tag,
      username: local.username,
    });
  }
  connectHostRange(getNewHost(from), to, port);
}

function connectRange({ hostStart, hostEnd, portStart, portEnd }) {
  if (!portStart) return;
  if (portEnd && portEnd < portStart) return;
  if (hostStart && !hostEnd) hostEnd = hostStart;

  if (!portEnd) portEnd = portStart + 1;
  else portEnd += 1;

  for (let port = portStart; port < portEnd; port += 1) {
    if (hostStart) {
      connectHostRange(hostStart, hostEnd, port);
    } else {
      if (port === local.port) continue;
      connect({
        port,
        host: local.host || local.address,
        localAddress: local.host,
        tag: local.tag,
        username: local.username,
      });
    }
  }
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
  fileAccepted[checksum] = true;
  send(clients[tag], message);
}

function exit(callback) {
  if (local.active) {
    allClients((client) => {
      client.end();
      client.destroy();
    });
    local.server.close(() => {
      local.active = false;
      console.log(`>> Bye! ${local.username}[${local.tag}]`);
      setImmediate(callback); // when reloading, why process.nextTick make the app slow
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
  connectServers,
};
