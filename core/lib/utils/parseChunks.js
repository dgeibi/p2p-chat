const parseJSON = require('./parseJSON');

const parseChunks = (chunks) => {
  const buffer = Buffer.concat(chunks);
  try {
    return parseJSON(buffer.toString());
  } catch (e) {
    return null;
  }
};

module.exports = parseChunks;
