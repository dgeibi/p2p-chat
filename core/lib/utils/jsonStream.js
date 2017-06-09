const { Transform } = require('stream');
const splicer = require('stream-splicer');
const parseChunks = require('./parseChunks');

const serialize = () =>
  new Transform({
    writableObjectMode: true,
    transform(chunk, encoding, callback) {
      const [header, body] = Array.isArray(chunk) ? chunk : [chunk, null];
      header.size = Buffer.isBuffer(body) ? body.byteLength : 0;
      const bufList = [Buffer.from(`${JSON.stringify(header)}\n`)];
      if (header.size > 0) bufList.push(body);
      const buffer = Buffer.concat(bufList);
      callback(null, buffer);
    },
  });

const parse = () => {
  const parseTransform = new Transform({
    readableObjectMode: true,
    transform(chunk, encoding, callback) {
      let toSubmit = false;
      if (!this.headerCaches) this.headerCaches = [];
      if (!this.bodyCaches) this.bodyCaches = [];

      if (!this.bodyLeft || this.bodyLeft < 0) {
        // receive header first
        const idx = chunk.indexOf('\n');
        if (idx >= 0) {
          // find header part
          const firstPart = chunk.slice(0, idx);
          this.headerCaches.push(firstPart);
          this.msg = parseChunks(this.headerCaches);
          if (this.msg) {
            this.headerCaches = [];

            const second = chunk.slice(idx + 1);
            if (this.msg.size > second.byteLength) {
              this.bodyLeft = this.msg.size;
              this.bodyCaches.push(second);
              this.bodyLeft -= second.byteLength;
            } else {
              this.bodyCaches.push(second.slice(0, this.msg.size));
              this.headerCaches.push(second.slice(this.msg.size));
              toSubmit = true;
            }
          }
        } else {
          // cannot find \n, cache header
          this.headerCaches.push(chunk);
        }
      } else if (chunk.byteLength > this.bodyLeft) {
        this.bodyCaches.push(chunk.slice(0, this.bodyLeft));
        this.headerCaches.push(chunk.slice(this.bodyLeft));
        toSubmit = true;
      } else {
        // receive part of body
        this.bodyCaches.push(chunk);
        this.bodyLeft -= chunk.byteLength;
        if (this.bodyLeft === 0) toSubmit = true;
      }

      if (toSubmit) {
        if (this.msg) this.msg.body = Buffer.concat(this.bodyCaches);
        else throw Error('message not found');
        callback(null, this.msg);
        this.msg = null;
        this.bodyCaches = [];
        this.bodyLeft = 0;
        return;
      }
      callback();
    },
  });

  return parseTransform;
};

const jsonStream = (stream) => {
  const pipeline = splicer.obj([serialize(), stream, parse()]);
  pipeline.orig = stream;
  return pipeline;
};

module.exports = jsonStream;
