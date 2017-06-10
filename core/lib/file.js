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
    size: data.byteLength,
  });

  filesCaches[checksum] = Object.assign({}, fileInfoMessage, {
    type: 'file',
    body: data,
  });
  return fileInfoMessage;
}

module.exports = {
  loadFile,
  loadFileInfo,
};
