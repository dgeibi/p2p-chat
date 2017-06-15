# p2p-chat-demo

一个简单的局域网P2P聊天工具

下载：https://pan.baidu.com/s/1dFCHGL7

## 开发

使用 [npm](https://nodejs.org/en/download/current/) 安装依赖

``` sh
$ npm install

# 中国用户安装方法
$ npm install -g cnpm --registry=https://registry.npm.taobao.org
$ cnpm install
```

运行

```
$ npm start
```

生成安装包

```
$ npm run dist
```

## 依赖说明

- "dateformat"：日期格式化
- "fs-extra": 简化输出文件的操作
- "getport": 获取可用的端口
- "ip": 获取本地IP地址
- "stream-splicer": 组装 streams
- "dgeibi/logger": 命令行打印

## 源文件说明

```
├── core
│   ├── index.js // 后端主程序
│   └── lib
│       ├── file.js // fileinfo 报文生成、file 报文缓存
│       ├── getTag.js // 生成 tag
│       ├── ipSet.js // 存储 IP 地址的集合
│       ├── login.js // 获取 IP 地址、可用端口号，生成 tag
│       ├── sendFile.js // 使用 TCP 短连接发送文件
│       └── utils
│           ├── getChecksum.js // 获取 md5 校验和
│           ├── getNewHost.js
│           ├── isIPLarger.js
│           ├── jsonStream.js // 包装 socket 流，处理缓存
│           └── ndjsonBody
│               ├── index.js // ndjson-body 序列化和解析
│               ├── parseChunks.js
│               ├── parseJSON.js
│               ├── README.md // ndjson-body 的说明
│               └── test.js
├── index.html
├── index.js // Electron 后端主程序，与 renderer.js、sub.js 通过 ipc 联系
├── renderer.js // 界面渲染，与 index.js 通过 ipc 联系
├── sub.js // Electron 的子程序，调用 core 目录的程序，与 index.js 通过 ipc 联系
└── view
    ├── bind.js
    ├── formatTag.js
    ├── index.css // 样式表
    ├── menu.js
    └── write.js // 消息打印
```

## LICENSE

[MIT](LICENSE)
