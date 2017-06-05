/* eslint-disable no-param-reassign, no-continue */
const net = require('net');
const fs = require('fs-extra');
const path = require('path');
const EventEmitter = require('events');

const events = new EventEmitter();

const logger = require('logger');

const getChecksum = require('./lib/utils/getChecksum');
const getNewHost = require('./lib/utils/getNewHost');
const parseChunks = require('./lib/utils/parseChunks');
const isIPLarger = require('./lib/utils/isIPLarger');

const ipSet = require('./lib/ipSet');
const login = require('./lib/login');
const send = require('./lib/send');
const sendFile = require('./lib/sendFile');

const { loadFile, loadFileInfo } = require('./lib/file');

const local = {
  active: false,
  clients: null,
};

// 已经确认接收的文件
const fileAccepted = {};

const getMessage = () => ({
  type: 'greeting',
  host: local.address,
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
    const data = Buffer.concat(fileChunkCaches);
    const { filename, username, tag } = message;
    const realChecksum = getChecksum(data);
    // 检查checksum
    if (!fileAccepted[realChecksum] || realChecksum !== message.checksum) {
      return;
    }

    const filepath = path.resolve('download', local.username, filename);
    fs.outputFile(filepath, data, (err) => {
      if (err) {
        logger.error(`${filename} write fail, ${err.message}`);
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

  socket
    .on('error', () => {
      if (socket.info && socket.info.localTag === local.tag) delete local.clients[socket.info.tag];
    })
    .once('data', (firstChunk) => {
      if (local.clients === null) {
        socket.end();
        return;
      }

      // 对发送文件的socket特殊处理
      const eolPos = firstChunk.indexOf('\n');
      if (eolPos > 0) {
        const message = parseChunks([firstChunk.slice(0, eolPos)]);
        if (!message) {
          socket.end();
          return;
        }
        const chunk = firstChunk.slice(eolPos + 1);
        // 已经登录, 报文类型是 fileinfo, 已经确认接收
        if (
          local.clients[message.tag] &&
          message.type === 'fileinfo' &&
          fileAccepted[message.checksum]
        ) {
          handleFileSocket(socket, message, chunk);
          return;
        }
        socket.end();
        return;
      }

      const session = parseChunks([firstChunk]);
      // 不符合预期的报文，或者重复连接 -> 断开连接
      if (session === null || session.type !== 'greeting' || local.clients[session.tag]) {
        socket.end();
        return;
      }

      // 添加信息
      const info = Object.assign({}, session);
      info.localTag = local.tag;
      socket.info = info;

      local.clients[session.tag] = socket;
      logger.verbose(`${session.username}[${session.tag}] login.`);
      events.emit('login', session.tag, session.username);

      // response id
      if (reGreeting) {
        const msg = getMessage();
        send(socket, msg);
      }

      socket.on('end', () => {
        if (socket.info.localTag === local.tag) {
          delete local.clients[session.tag];
          logger.verbose(`${session.username}[${session.tag}] logout.`);
          events.emit('logout', session.tag, session.username);
        }
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
                  logger.err('file-send-fail', file.filename, e.message);
                  events.emit('file-send-fail', tag, username, file.filename, checksum, e.message);
                } else {
                  events.emit('file-sent', tag, username, file.filename, checksum);
                }
              }
            );
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
    const ipset = ipSet();
    // 保存用户地址
    allClients((client) => {
      const { host, port } = client.info;
      ipset.add(host, port);
    });
    options.ipset = ipset;
    exit((err) => {
      if (!err) {
        setup(options, callback);
      } else {
        callback(err);
      }
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
    local.clients = {};

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
      logger.verbose('>> opened server on', server.address());
      logger.verbose(`>> Hi! ${username}[${tag}]`);

      // 3. connect to other servers
      connectServers(opts);
      local.active = true;
      callback(null, id);
    });
  });
}

function connectServers(opts) {
  if (!local.server.listening) return;
  if (!opts.ipset) opts.ipset = ipSet();
  connectRange(opts);
  if (opts.connects) {
    opts.connects.forEach((conn) => {
      const host = conn.host || local.address;
      const port = conn.port;
      opts.ipset.add(host, port);
    });
    delete opts.connects;
  }
  opts.ipset.forEach((host, port) => {
    if (!(port === local.port && host === local.address)) {
      const socket = net
        .connect(
        {
          host,
          port,
        },
          () => {
            send(socket, getMessage());
            handleSocket(socket);
          }
        )
        .on('error', (e) => {
          logger.warn(e.message);
        });
    }
  });
}

function connectHostRange(from, to, port, ipset) {
  if (isIPLarger(from, to)) return; // 超过范围
  ipset.add(from, port);
  connectHostRange(getNewHost(from), to, port, ipset);
}

function connectRange({ hostStart, hostEnd, portStart, portEnd, ipset }) {
  if (!portStart) return;
  if (portEnd && portEnd < portStart) return;
  if (hostStart && !hostEnd) hostEnd = hostStart;

  if (!portEnd) portEnd = portStart + 1;
  else portEnd += 1;

  if (hostStart) {
    for (let port = portStart; port < portEnd; port += 1) {
      connectHostRange(hostStart, hostEnd, port, ipset);
    }
  } else {
    const host = local.address;
    for (let port = portStart; port < portEnd; port += 1) {
      ipset.add(host, port);
    }
  }
}

function getUserInfos() {
  return Object.keys(local.clients).map(tag => ({
    tag,
    username: local.clients[tag].info.username,
  }));
}

function textToUsers(tags, text) {
  tags.forEach((tag) => {
    const message = getMessage();
    message.type = 'text';
    message.text = text;
    send(local.clients[tag], message);
  });
}

function sendFileToUsers(tags, filepath) {
  tags.forEach((tag) => {
    const message = getMessage();
    loadFileInfo(filepath, message);
    send(local.clients[tag], message);
  });
}

function allClients(fn) {
  Object.keys(local.clients).forEach((tag) => {
    fn(local.clients[tag]);
  });
}

function acceptFile(tag, checksum) {
  const message = getMessage();
  message.type = 'file-accepted';
  message.checksum = checksum;
  fileAccepted[checksum] = true;
  send(local.clients[tag], message);
}

function exit(callback) {
  if (local.active) {
    allClients((client) => {
      client.end();
      client.destroy();
    });
    local.server.close(() => {
      local.active = false;
      logger.verbose(`>> Bye! ${local.username}[${local.tag}]`);
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
