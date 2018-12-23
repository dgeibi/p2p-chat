# p2p-chat

a P2P LAN chatting and file sharing tool

[Releases](https://github.com/dgeibi/p2p-chat/releases)

## Background

原为计算机网络课设，从2017年5月开始开发，我尝试在 TCP 上实现应用层的网络协议。

### ~~一切用 JSON~~

传输的数据格式用JSON，参考 https://nodejs.org/api/buffer.html#buffer_buf_tojson ，我试着将 buffer 包裹在 JSON 里，连大文件的数据也放在里边，binary 转成 utf8 字符串……

TCP 传输的最小单位是字节，从 data 事件拿到的数据可能不是完整的消息，如果一个 socket 连续发送消息，字节可能会黏住，分不出需要的消息的结束位置。因此，我要实现一个解析器，从字节流中解析出消息。

我想到的第一个解析数据的方法是 try catch + JSON.parse，将拿到的数据存放到一个数组中，拼接数组中的 buffer，尝试用 JSON.parse 取得数据，取不出时接着等下一个块继续以上步骤，直到 parse 成功。传小文件没有问题，但传大文件就会让 node 消耗大量内存，卡死。我怀疑聊天核心模块在 electron main process 进行操作影响 UI 的流畅程度导致卡死，就 fork 出一个子进程，但没有效果。

我不得不开始重新思考如何设计传输协议，于是……想到了 stream 和 HTTP。

HTTP 消息有 head 和 body 两个部分，head 的格式严格定义，body 部分几乎没有限制，两者用`\r\n\r\n`分割。

对于短连接，断开 TCP 连接，可以让浏览器知道消息结束。

对于长连接，head 可以记录 body 的长度 `Content-Length` 用来判断消息是否结束，这只适用于数据大小已经预先知道的情况，对于聊天工具的传输文件已经足够了。题外话，HTTP 还有其它方法如分块传输编码。

之前内存泄漏的原因是在 JSON 被解析出来前，内存中一直积累 JSON 数据，解析成功后才将很多个小 buffer 释放掉，将拼接得到的大 buffer 写入文件系统，才算释放完内存。

在分割 head 和 body 的基础上，借助 stream 及时生效的特性，我们可以将 body 的数据及时写入文件系统的 writeStream 中，不在内存积累太多数据。

### 设计

* head：为了简单还用 JSON，`JSON.stringify` 的结果没有 `\n`，用 `\n` 标记 head 结束就好，剩下的就是 body 了。如果有 body，就要有一个字段标记 body 的长度。
* body：可选。格式任意。

### 实现

主要是使用 `buffer.indexOf('\n')` 找到 head 的结束位置，在 `\n` 之前的 buffer 是 head 的组成部分，合并这些 buffer，用 `JSON.parse` 解析出 head。body 在 `\n` 后，根据给定长度将字节写到一个 writeStream。

## Development

Use [yarn](https://yarnpkg.com) to install dependencies

```
$ yarn
```

Run the current application in development mode

```
$ yarn app dev
```

Create packages

``` sh
$ yarn app dist       # build for linux, win32, win64
$ yarn app dist:linux # build for linux
$ yarn app dist:win32 # build for win32
$ yarn app dist:win64 # build for win64
```

Then check out the output in `packages/p2p-chat/dist`.

## LICENSE

[MIT](LICENSE)
