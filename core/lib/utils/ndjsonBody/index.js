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
  this._headCaches = [];
  this._bodyCaches = [];
  this._bodyLeft = 0;
}
util.inherits(Parse, Transform);

Parse.prototype._submitMsg = function _submitMsg() {
  if (!this._msg) {
    this.emit('error', Error('message not found'));
    return;
  }
  this._msg.body = Buffer.concat(this._bodyCaches);
  this.push(this._msg);
  this._msg = null;
  this._bodyCaches = [];
  this._bodyLeft = 0;
};

Parse.prototype._handleBodyStart = function _handleBodyStart(buffer) {
  if (buffer.byteLength > this._bodyLeft) {
    // has head start
    this._bodyCaches.push(buffer.slice(0, this._bodyLeft));
    const left = buffer.slice(this._bodyLeft);
    this._bodyLeft = 0;
    this._submitMsg();
    this._transform(left);
  } else {
    // cache the whole buffer
    this._bodyCaches.push(buffer);
    this._bodyLeft -= buffer.byteLength;
    if (this._bodyLeft === 0) this._submitMsg();
  }
};

Parse.prototype._transform = function _transform(chunk, encoding, callback) {
  if (this._bodyLeft <= 0) {
    // receive head first
    const idx = chunk.indexOf('\n');
    if (idx >= 0) {
      // find a part of head ending with \n
      const first = chunk.slice(0, idx);
      this._headCaches.push(first);
      this._msg = parseChunks(this._headCaches);
      if (this._msg) {
        this._headCaches = []; // empty cache
        const second = chunk.slice(idx + 1);
        this._bodyLeft = this._msg.bodyLength;
        this._handleBodyStart(second);
      }
    } else {
      // cannot find \n, cache head
      this._headCaches.push(chunk);
    }
  } else {
    this._handleBodyStart(chunk);
  }

  if (callback) callback();
};

module.exports = {
  Parse,
  Serialize,
};
