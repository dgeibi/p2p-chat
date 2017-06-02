function parseBuffer(key, value) {
  return value && value.type === 'Buffer'
    ? Buffer.from(value.data)
    : value;
}

function parseJSON(data) {
  return JSON.parse(data, parseBuffer);
}

module.exports = parseJSON;
