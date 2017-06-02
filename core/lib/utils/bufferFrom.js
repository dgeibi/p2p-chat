const bufferFrom = obj => Buffer.from(JSON.stringify(obj));

module.exports = bufferFrom;
