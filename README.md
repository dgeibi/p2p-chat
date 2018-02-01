# p2p-chat

a P2P LAN chatting and file sharing tool

[Releases](https://github.com/dgeibi/p2p-chat/releases)

## Development

Use [yarn](https://yarnpkg.com) to install dependencies

```
$ yarn
```

Run the current application in development mode

```
$ yarn app start
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
