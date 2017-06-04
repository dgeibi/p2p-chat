# p2p-chat-demo

一个简单的局域网P2P聊天工具

下载：https://pan.baidu.com/s/1dFCHGL7

## 开发

**Node.js**

- 官方下载地址：https://nodejs.org/en/download/current/
- 中国安装包镜像：
    - Windows 64位：https://npm.taobao.org/mirrors/node/latest-v8.x/node-v8.0.0-x64.msi
    - Windows 32位：https://npm.taobao.org/mirrors/node/latest-v8.x/node-v8.0.0-x86.msi
    - 其它见：https://npm.taobao.org/mirrors/node/latest-v8.x/

**安装依赖**

``` sh
$ npm install

# 中国用户安装方法
$ npm install -g cnpm --registry=https://registry.npm.taobao.org
$ cnpm install
```

**运行**

```
$ npm start
```

**生成安装包**

```
$ npm run dist
```

## 依赖说明

- "dateformat"：进行日期格式化
- "fs-extra": 用于简化输出文件的操作
- "getport": 用于获取可用的端口
- "ip": 用于获取本地IP地址

## 源文件说明

```
├── core
│   ├── index.js // 后端主程序
│   └── lib
│       ├── file.js // fileinfo 报文生成、文件缓存
│       ├── getTag.js // 生成tag
│       ├── ipSet.js // ipset 集合
│       ├── isValidMessage.js
│       ├── login.js // 获取IP地址、可用端口号，生成tag
│       ├── sendFile.js // 使用短连接发送文件
│       ├── send.js // 包装 socket.write，方便发送报文
│       └── utils // 包含一些工具类程序
│           ├── bufferFrom.js
│           ├── checkProps.js
│           ├── getChecksum.js // 获取md5校验和
│           ├── getNewHost.js
│           ├── isIPLarger.js
│           ├── parseChunks.js // 解析buffer数组到对象
│           └── parseJSON.js
├── index.html // 页面
├── index.js // Electron 后端主程序
├── renderer.js // 前端渲染程序
├── sub.js // Electron的子程序，调用core目录的程序
└── view // 前端的一些东西
    ├── formatTag.js
    ├── index.css // 页面样式
    ├── menu.js
    └── write.js
```

## LICENSE

[MIT](LICENSE)
