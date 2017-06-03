/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-extraneous-dependencies
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const cp = require('child_process');
const EventEmitter = require('events');

require('./view/menu.js');
const pkg = require('./package.json');

const emitter = new EventEmitter();
const sub = cp.fork(`${__dirname}/sub.js`);

let win;

function createWindow() {
  win = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    width: 800,
    height: 600,
    title: pkg.name,
    webPreferences: {
      nodeIntegrationInWorker: true,
    },
  });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true,
      hash: 'settings',
    })
  );

  win.on('closed', () => {
    win = null;
    sub.kill();
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

const frontToBack = (key) => {
  ipcMain.on(key, (event, ...args) => {
    sub.send({
      key,
      args,
    });
  });
};

frontToBack('local-file');
frontToBack('change-setting');
frontToBack('setup');
frontToBack('logout');
frontToBack('local-text');
frontToBack('accept-file');

sub.on('message', (m) => {
  const { key, args } = m;
  emitter.emit(key, ...args);
  win.webContents.send(key, ...args);
});

sub.on('error', (err) => {
  win.webContents.send('bg-err', err.message);
});

emitter.on('setup-reply', (errMsg, id) => {
  if (!errMsg) {
    const { username } = id;
    win.setTitle(`${username}[${id.tag.slice(0, 5)}] - ${pkg.name}`);
  }
});
