const fs = require('fs');
const path = require('path');
const getChecksum = require('./utils/getChecksum');

const fileMessageCaches = {};

function loadFile(checksum) {
  return fileMessageCaches[checksum];
}

function loadFileInfo(filepath, message) {
  const data = fs.readFileSync(filepath);

  const filename = path.basename(filepath);
  const checksum = getChecksum(data);

  fileMessageCaches[checksum] = Object.assign({}, message, {
    type: 'file',
    data,
    filename,
    checksum,
  });

  const fileInfoMessage = Object.assign(message, {
    type: 'fileinfo',
    filename,
    checksum,
    size: data.buffer.byteLength,
  });
  return fileInfoMessage;
}

module.exports = {
  loadFile,
  loadFileInfo,
};
