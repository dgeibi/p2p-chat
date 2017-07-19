# p2p-chat-demo

一个基于 [dgeibi/p2p-chat](https://github.com/dgeibi/p2p-chat) 的局域网P2P聊天工具

下载：https://github.com/dgeibi/p2p-chat-demo/releases

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

- "p2p-chat"：逻辑实现
- "dateformat"：日期格式化
- "logger": 命令行打印

## 源文件说明

```
├── index.html
├── index.js // Electron 后端主程序，与 renderer.js、worker.js 通过 ipc 联系
├── renderer.js // 界面渲染，与 index.js 通过 ipc 联系
├── worker.js // Electron 的子程序，调用 p2p-chat 后台，与 index.js 通过 ipc 联系
└── view
    ├── bind.js
    ├── formatTag.js
    ├── index.css // 样式表
    ├── menu.js
    └── write.js // 消息打印
```

## LICENSE

[MIT](LICENSE)
