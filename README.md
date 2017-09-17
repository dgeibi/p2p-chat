# p2p-chat

a P2P LAN chatting and file sharing tool

[Releases](https://github.com/dgeibi/p2p-chat/releases)

## Development

Use [npm](https://nodejs.org/) to install dependencies

```
$ npm install
```

Run the current application in development mode

```
$ npm run app -- start
```

Create packages

``` sh
$ npm run app -- dist       # build for linux, win32, win64
$ npm run app -- dist:linux # build for linux
$ npm run app -- dist:win32 # build for win32
$ npm run app -- dist:win64 # build for win64
```

Then check out the output in `packages/p2p-chat/dist`.

## LICENSE

[MIT](LICENSE)
