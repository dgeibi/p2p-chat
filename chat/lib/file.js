const fs = require('fs');
const path = require('path');
const net = require('net');

const md5 = require('./utils/md5');
const enhanceSocket = require('./enhanceSocket');

const messages = {};

/**
 * Get `fileinfo` message
 * @param {string} filepath - full file path
 * @param {object} message - message template
 * @param {function(Error, object)} callback
 */
function getInfoMsg(filepath, message, callback) {
  fs.stat(filepath, (err, stats) => {
    if (err || !stats.isFile()) {
      callback(Error(`${filepath} is not a file`));
      return;
    }
    const size = stats.size;
    md5.file(filepath, false, (md5Error, checksum) => {
      if (md5Error) {
        callback(md5Error);
        return;
      }
      const filename = path.basename(filepath);
      const fileInfoMessage = Object.assign(message, {
        type: 'fileinfo',
        filename,
        checksum,
        size,
      });
      messages[checksum] = Object.assign({}, message, {
        filepath,
        type: 'file',
      });
      callback(null, fileInfoMessage);
    });
  });
}

/**
 * 发送文件
 * @param {string} checksum
 * @param {object} options connect options
 * @param {function(?Error, ?string)} callback
 */
function send(checksum, options, callback) {
  const fileMsg = Object.assign({}, messages[checksum]);
  if (!fileMsg) {
    callback(Error(`file not loaded from ${checksum}`));
    return;
  }
  const { filepath, filename } = fileMsg;
  fs.stat(filepath, (err) => {
    if (err) {
      callback(Error(`fail to read file ${filepath}`), filename);
      return;
    }
    delete fileMsg.filepath;
    const socket = net
      .connect(options, () => {
        enhanceSocket({ socket });
        fileMsg.bodyLength = fileMsg.size;
        socket.send(fileMsg);
        const readStream = fs.createReadStream(filepath);
        readStream.pipe(socket);
        readStream.on('end', () => {
          socket.end();
        });
      })
      .on('error', (e) => {
        callback(e, filename);
      });
  });
}

module.exports = {
  getInfoMsg,
  send,
};
