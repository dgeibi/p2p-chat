const { Parse } = require('./index.js');
const assert = require('assert');

const getBuffer = (h, b) => {
  const head = Object.assign({}, h);
  const body = Buffer.from(b);
  head.bodyLength = body.byteLength;
  return Buffer.concat([Buffer.from(`${JSON.stringify(head)}\n`), body]);
};

let count = 0;
const expects = ['1', '2', '3', '4\n'];

const s = Parse();

s.on('data', (msg) => {
  const body = msg.body.toString();
  assert(body === expects[count], `body should be ${expects[count]}`);
  count += 1;
});

s.write(Buffer.concat(expects.map(x => getBuffer({}, x))));
