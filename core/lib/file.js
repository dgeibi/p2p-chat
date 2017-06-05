const fs = require('fs');
const path = require('path');
const getChecksum = require('./utils/getChecksum');

const filesCaches = {};

function loadFile(checksum) {
  return filesCaches[checksum];
}

function loadFileInfo(filepath, message) {
  const data = fs.readFileSync(filepath);

  const filename = path.basename(filepath);
  const checksum = getChecksum(data);

  const fileInfoMessage = Object.assign(message, {
    type: 'fileinfo',
    filename,
    checksum,
    size: data.buffer.byteLength,
  });

  // 报文和数据使用 EOL 分隔
  filesCaches[checksum] = Object.assign({}, fileInfoMessage, {
    data: Buffer.concat([Buffer.from(`${JSON.stringify(fileInfoMessage)}\n`), data]),
  });
  return fileInfoMessage;
}

module.exports = {
  loadFile,
  loadFileInfo,
};
