# ndjson-body

将可能很大的数据从 JSON 中剥离出来，避免传输 JSON 数据过程中不必要的解析工作。

## 使用方法

**ndjsonBody.Serialize(opts)**

序列化时，根据 body 的字节数，增加 bodyLength 字段，并将 body 字段放到 JSON 字符串之后：

``` js
const serialize = ndjsonBody.Serialize();

serialize.on('data', (data) => {
  console.log(data.toString());
  // 收到的数据是一行以 \n 结尾的 JSON 字符串紧接着 body 的数据
  // {"type":"file","bodyLength":3}
  // 123
});

serialize.write({
  type: 'file',
  body: '123', // body是可选的，但必须可以通过 Buffer.from() 转化为 Buffer
});
```

**ndjsonBody.Parse(opts)**

对应的解析转化如下：

``` js
const parse = ndjsonBody.Parse();

parse.on('data', (message) => {
  console.log(message);
  // { type: 'text', text: 'ha' }
  // { type: 'file', bodyLength: 3, body: <Buffer 61 62 63> }
  // { type: 'file', bodyLength: 4, body: <Buffer 64 65 66 67> }
});

parse.write(Buffer.from(
  [
    '{"type":"text","text":"ha"}',
    '{"type":"file","bodyLength":3}',
    'abc{"type":"file","bodyLength":4}',
    'defg',
  ].join('\n')
));
```
