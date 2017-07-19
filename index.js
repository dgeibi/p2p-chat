/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-extraneous-dependencies
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const { fork } = require('child_process');
const EventEmitter = require('events');
const logger = require('logger');

require('./view/menu.js');
const pkg = require('./package.json');

const workerProxy = new EventEmitter();
const limit = 4;
let crashTime = 0;
let win;
let worker;

function createWorker() {
  worker = fork(`${__dirname}/worker.js`, ['--color']);
  logger.debug(`new chat worker ${worker.pid}`);
  worker.on('message', (m) => {
    const { key, args } = m;
    if (key) {
      workerProxy.emit(key, ...args);
      win.webContents.send(key, ...args);
    }
  });

  worker.on('error', (err) => {
    win.webContents.send('bg-err', err.message);
    logger.error(err);
    if (crashTime < limit) createWorker();
    crashTime += 1;
  });

  worker.on('exit', () => {
    logger.debug(`chat worker ${worker.pid} exits`);
  });
}
createWorker();

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
  });
}

const frontToBack = (key) => {
  ipcMain.on(key, (event, ...args) => {
    worker.send({
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

workerProxy.on('setup-reply', (errMsg, id) => {
  if (!errMsg) {
    const { username } = id;
    win.setTitle(`${username}[${id.tag.slice(0, 5)}] - ${pkg.name}`);
  }
});

process.on('exit', () => {
  worker.kill();
});

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
