/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-extraneous-dependencies
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const chat = require('./core');
const pkg = require('./package.json');

require('./view/menu.js');

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

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  win.on('closed', () => {
    win = null;
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

ipcMain.on('change-setting', (event, opts) => {
  chat.connectServers(opts);
});

ipcMain.on('setup', (event, opts) => {
  chat.setup(opts, (err, id) => {
    if (err) {
      console.log(err);
      event.sender.send('setup-reply', err.message, id);
    } else {
      const { username } = opts;
      event.sender.send('setup-reply', null, id);
      win.setTitle(`${username}[${id.tag.slice(0, 5)}] - ${pkg.name}`);
    }
  });
});

ipcMain.on('logout', (event) => {
  chat.exit((err) => {
    if (err) {
      console.log(err);
      event.sender.send('logout-reply', err.message);
    } else {
      event.sender.send('logout-reply', null);
    }
  });
});

ipcMain.on('local-text', (event, tags, text) => {
  chat.textToUsers(tags, text);
});

ipcMain.on('local-file', (event, tags, filepath) => {
  chat.sendFileToUsers(tags, filepath);
});

ipcMain.on('accept-file', (event, tag, checksum) => {
  console.log(tag, checksum);
  chat.acceptFile(tag, checksum);
});

chat.events.on('login', (tag, username) => {
  win.webContents.send('people-login', chat.getUserInfos(), tag, username);
});

chat.events.on('logout', (tag, username) => {
  win.webContents.send('people-logout', chat.getUserInfos(), tag, username);
});

const bypass = (backEvent, frontEvent = backEvent) => {
  chat.events.on(backEvent, (...args) => {
    win.webContents.send(frontEvent, ...args);
  });
};

// bypass events;
bypass('text');
bypass('fileinfo');
bypass('file-receiced');
bypass('file-write-fail');
bypass('file-accepted');
