/* eslint-disable no-underscore-dangle */
const util = require('util');
const { Transform } = require('stream');
const parseChunks = require('./parseChunks');

function Serialize(options) {
  if (!(this instanceof Serialize)) {
    return new Serialize(options);
  }
  const opts = Object.assign({}, options, { writableObjectMode: true });
  Transform.call(this, opts);
}
util.inherits(Serialize, Transform);

Serialize.prototype._transform = function _transform(chunk, encoding, callback) {
  const head = Object.assign({}, chunk);
  const body = head.body;
  delete head.body;
  head.bodyLength = Buffer.isBuffer(body) ? body.byteLength : 0;
  const bufList = [Buffer.from(`${JSON.stringify(head)}\n`)];
  if (head.bodyLength > 0) bufList.push(body);
  const buffer = Buffer.concat(bufList);
  callback(null, buffer);
};

function Parse(options) {
  if (!(this instanceof Parse)) {
    return new Parse(options);
  }
  const opts = Object.assign({}, options, { readableObjectMode: true });
  Transform.call(this, opts);
  this.headCaches = [];
  this.bodyCaches = [];
}
util.inherits(Parse, Transform);

Parse.prototype._submitMsg = function _submitMsg() {
  if (this.msg) this.msg.body = Buffer.concat(this.bodyCaches);
  else this.emit('error', Error('message not found'));
  this.push(this.msg);
  this.msg = null;
  this.bodyCaches = [];
  this.bodyLeft = 0;
};

Parse.prototype._submitWithLeft = function _submitWithLeft(buffer) {
  this.bodyCaches.push(buffer.slice(0, this.bodyLeft));
  const left = buffer.slice(this.bodyLeft);
  process.nextTick(() => this._transform(left));
  this._submitMsg();
};

Parse.prototype._handleNotLeft = function _handleNotLeft(buffer) {
  this.bodyCaches.push(buffer);
  this.bodyLeft -= buffer.byteLength;
  if (this.bodyLeft === 0) this._submitMsg();
};

Parse.prototype._transform = function _transform(chunk, encoding, callback) {
  if (!this.bodyLeft || this.bodyLeft < 0) {
    // receive head first
    const idx = chunk.indexOf('\n');
    if (idx >= 0) {
      // find head
      const first = chunk.slice(0, idx);
      this.headCaches.push(first);
      this.msg = parseChunks(this.headCaches);
      if (this.msg) {
        this.headCaches = [];
        const second = chunk.slice(idx + 1);
        this.bodyLeft = this.msg.bodyLength;
        if (this.msg.bodyLength > second.byteLength) {
          this._handleNotLeft(second);
        } else {
          this._submitWithLeft(second);
        }
      }
    } else {
      // cannot find \n, cache head
      this.headCaches.push(chunk);
    }
  } else if (chunk.byteLength > this.bodyLeft) {
    this._submitWithLeft(chunk);
  } else {
    // receive part of body
    this._handleNotLeft(chunk);
  }

  if (callback) callback();
};

module.exports = {
  Parse,
  Serialize,
};
