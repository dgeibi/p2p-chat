/* eslint-disable no-underscore-dangle */
const util = require('util');
const { Transform } = require('stream');
const splicer = require('stream-splicer');
const parseChunks = require('./parseChunks');

function Serialize(options) {
  if (!(this instanceof Serialize)) { return new Serialize(options); }
  const opts = Object.assign({}, options, { writableObjectMode: true });
  Transform.call(this, opts);
}
util.inherits(Serialize, Transform);

Serialize.prototype._transform = function _transform(chunk, encoding, callback) {
  const header = Object.assign({}, chunk);
  const body = header.body;
  delete header.body;
  header.bodyLength = Buffer.isBuffer(body) ? body.byteLength : 0;
  const bufList = [Buffer.from(`${JSON.stringify(header)}\n`)];
  if (header.bodyLength > 0) bufList.push(body);
  const buffer = Buffer.concat(bufList);
  callback(null, buffer);
};


function Parse(options) {
  if (!(this instanceof Parse)) { return new Parse(options); }
  const opts = Object.assign({}, options, { readableObjectMode: true });
  Transform.call(this, opts);
  this.headerCaches = [];
  this.bodyCaches = [];
}
util.inherits(Parse, Transform);

Parse.prototype._transform = function _transform(chunk, encoding, callback) {
  let toSubmit = false;

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
        if (this.msg.bodyLength > second.byteLength) {
          this.bodyLeft = this.msg.bodyLength;
          this.bodyCaches.push(second);
          this.bodyLeft -= second.byteLength;
        } else {
          this.bodyCaches.push(second.slice(0, this.msg.bodyLength));
          this.headerCaches.push(second.slice(this.msg.bodyLength));
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
};

const jsonStream = (stream) => {
  const pipeline = splicer.obj([Serialize(), stream, Parse()]);
  pipeline.orig = stream;
  return pipeline;
};

module.exports = jsonStream;
