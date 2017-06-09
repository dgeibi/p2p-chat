const { Transform } = require('stream');
const splicer = require('stream-splicer');
const parseChunks = require('./parseChunks');

const serialize = () =>
  new Transform({
    writableObjectMode: true,
    transform(chunk, encoding, callback) {
      const buffer = Buffer.from(`${JSON.stringify(chunk)}\n`);
      callback(null, buffer);
    },
  });

const parse = () =>
  new Transform({
    readableObjectMode: true,
    transform(chunk, encoding, callback) {
      if (!this.chunks) {
        this.chunks = [];
      }
      const idx = chunk.indexOf('\n');
      if (idx >= 0) {
        const first = chunk.slice(0, idx);
        const second = chunk.slice(idx + 1);
        this.chunks.push(first);
        const obj = parseChunks(this.chunks);
        this.chunks.splice(0, this.chunks.length);
        this.chunks.push(second);
        if (obj) {
          callback(null, obj);
          return;
        }
      } else {
        this.chunks.push(chunk);
      }
      callback();
    },
  });

const jsonStream = (stream) => {
  const pipeline = splicer.obj([serialize(), stream, parse()]);
  pipeline.orig = stream;
  return pipeline;
};

module.exports = jsonStream;
