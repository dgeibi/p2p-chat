const { Parse, Serialize } = require('./index.js');
const assert = require('assert');

const getBuffer = (h, b) => {
  const head = Object.assign({}, h);
  const body = Buffer.from(b);
  head.bodyLength = body.byteLength;
  return Buffer.concat([Buffer.from(`${JSON.stringify(head)}\n`), body]);
};

// 1. parse: body
(() => {
  let count = 0;
  const expects = ['1', '2', '3', '4\n'];
  const parse = Parse();

  parse.on('data', (msg) => {
    const body = msg.body.toString();
    assert(body === expects[count], `body should be ${expects[count]}`);
    count += 1;
  });

  parse.write(Buffer.concat(expects.map(x => getBuffer({}, x))));
})();

// 2. parse: no body and with body
(() => {
  const parse = Parse();
  parse.on('data', (message) => {
    assert(message, 'message should not be empty');
    switch (message.type) {
      case 'text':
        assert(message.text, 'text should not be empty');
        break;
      case 'file':
        assert(Buffer.isBuffer(message.body, 'body should be a Buffer'));
        break;
      default:
        break;
    }
  });

  parse.write(
    Buffer.from(
      [
        '{"type":"text","text":"ha"}',
        '{"type":"file","bodyLength":3}',
        'abc{"type":"file","bodyLength":4}',
        'defg',
      ].join('\n')
    )
  );
})();

// 3. serialize
(() => {
  const serialize = Serialize();

  serialize.on('data', (data) => {
    const str = data.toString();
    assert(str === '{"type":"file","bodyLength":3}\n123', 'fail to serialize');
  });

  serialize.write({
    type: 'file',
    body: '123',
  });
})();
