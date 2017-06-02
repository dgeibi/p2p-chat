// eslint-disable-next-line import/no-extraneous-dependencies
const { ipcRenderer } = require('electron');
const formatTag = require('./view/formatTag');

const view = document.querySelector('.view');
const aside = document.querySelector('aside');
const textarea = document.querySelector('textarea');
const loginBtn = document.querySelector('#login-btn');
const logoutBtn = document.querySelector('#logout-btn');
const fileBtn = document.querySelector('.file-btn');
const chatMsgSubmitBtn = document.querySelector('#submit-btn');

const template = {};

const defaultConfig = {
  msgCount: 0,
  username: 'anonymous',
  tag: null,
  users: null,
  login: false,
  port: 8087,
  portStart: 8087,
  portEnd: 8090,
};

const local = Object.assign({}, defaultConfig);
let important = null;

function bind(object, dataKey, defaultObject = {}, key) {
  Object.defineProperty(object, key, {
    get() {
      const node = document.querySelector(`[data-${dataKey}="${key}"]`);
      if (!node) {
        console.log(key);
        return defaultObject[key];
      }
      const value = node[node.dataset.valueKey || 'value'] || defaultObject[key];
      if (node.dataset.type === 'number') return Number(value);
      return value;
    },
    set(value) {
      const node = document.querySelector(`[data-${dataKey}="${key}"]`);
      if (node) node[node.dataset.valueKey || 'value'] = value;
      else console.log(key, dataKey);
    },
  });
}

const bindLocal = bind.bind(null, local, 'local', defaultConfig);
bindLocal('username');
bindLocal('host');
bindLocal('port');
bindLocal('hostStart');
bindLocal('hostEnd');
bindLocal('portStart');
bindLocal('portEnd');

Object.defineProperty(local, 'connects', {
  get() {
    return Array.from(document.querySelectorAll('.connect-list li')).map((item) => {
      const host = item.querySelector('[data-connect="host"]').value;
      const port = parseInt(item.querySelector('[data-connect="port"]').value, 10);
      if (port) return { host, port };
      return undefined;
    }).filter(i => !!i);
  },
  set() {},
});

const state = {
  set login(success) {
    local.login = success;
    local.msgCount = 0;
    loginBtn.innerHTML = success ? '设置' : '登录';
    logoutBtn.classList[success ? 'remove' : 'add']('hide');
    fileBtn.classList[success ? 'remove' : 'add']('hide');
    chatMsgSubmitBtn.classList[success ? 'remove' : 'add']('hide');
    aside.classList[success ? 'remove' : 'add']('hide');
    if (!success) state.users = [];
  },

  set users(users) {
    local.users = users;
    aside.innerHTML = users.map(user => `<div><input type="checkbox" id="${user.tag}" checked><label for="${user.tag}">${user.username}[${formatTag(user.tag)}]</label></div>`).join('');
  },
};

const { writeMonthDay, writeMsg, writeUserMsg, writeErrorMsg } = require('./view/write.js')(view, local);

ipcRenderer.on('logout-reply', (event, errMsg) => {
  const success = !errMsg;
  if (success) {
    writeMsg('>> 登出成功');
    state.login = false;
  } else {
    writeErrorMsg('>> 登出失败！');
    writeErrorMsg(`>> ${errMsg}`);
  }
});

// handle reply
ipcRenderer.on('setup-reply', (event, errMsg, id) => {
  writeMonthDay();
  const success = !errMsg;
  state.login = success;
  if (success) {
    Object.assign(local, id);
    const { username, host, port } = id;
    const login = true;
    important = { username, host, port, login };
    writeMsg('>> 登录成功');
    writeMsg(`>> 你好，${username}[${formatTag(local.tag)}].`);
    writeMsg(`>> 你的地址是${host || id.address}:${port}`);
  } else {
    writeErrorMsg('>> 登录失败');
    writeErrorMsg(`>> ${errMsg}`);
  }
});

ipcRenderer.on('people-login', (event, users, tag, username) => {
  writeMsg(`>> ${username}[${formatTag(tag)}] 已上线`);
  state.users = users;
});

ipcRenderer.on('people-logout', (event, users, tag, username) => {
  writeMsg(`>> ${username}[${formatTag(tag)}] 已下线`);
  state.users = users;
});

ipcRenderer.on('text', (event, tag, username, text) => {
  writeUserMsg(tag, username, text);
});

ipcRenderer.on('fileinfo', (event, message) => {
  const { username, tag, filename, checksum, size } = message;
  writeMsg(`>> ${username}[${formatTag(tag)}] 想发给你 ${filename}(${size} 字节)`);
  writeMsg(`<a data-checksum="${checksum}" href="#">确认接收${filename}</a>`);
  const link = document.querySelector(`[data-checksum="${checksum}"]`);
  link.addEventListener('click', () => {
    console.log('clicked');
    ipcRenderer.send('accept-file', tag, checksum);
    link.remove();
  });
});

ipcRenderer.on('file-receiced', (event, message) => {
  const { tag, username, filename, filepath } = message;
  writeMsg(`>> 已收到 ${username}[${formatTag(tag)}] 发送的 ${filename}`);
  writeMsg(`文件在 ${filepath}。`);
});

ipcRenderer.on('file-sent', (event, tag, username, filename) => {
  writeMsg(`>> ${filename} 已发送给 ${username}[${formatTag(tag)}]`);
});

ipcRenderer.on('file-send-fail', (event, tag, username, filename, checksum, errMsg) => {
  writeErrorMsg(`>> ${filename} 发送给 ${username}[${formatTag(tag)}] 时出错`);
  writeErrorMsg(`>> ${errMsg}`);
});

ipcRenderer.on('file-write-fail', (event, message) => {
  const { tag, username, filename } = message;
  writeMsg(`>> ${username}[${formatTag(tag)}] 发送的 ${filename} 接收失败。`);
});

ipcRenderer.on('bg-err', (event, errMsg) => {
  writeErrorMsg('>> 后台出错了！');
  writeErrorMsg(`>> ${errMsg}`);
});

// 已选择的文件显示
const filePath = document.querySelector('.file-path');
const fileInput = document.querySelector('.file-input');
fileInput.addEventListener('change', function handleFilesChange() {
  const files = Array.from(this.files);
  filePath.innerHTML = files.map(file => `<li>${file.name}</li>`).join('');
});

// handle chat message submit
chatMsgSubmitBtn.addEventListener('click', (e) => {
  e.preventDefault();

  // 0. get selected tags
  const tags = Array.from(aside.querySelectorAll('input[type=checkbox]'))
    .filter(user => user.checked)
    .map(user => user.id);

  // 1. send text
  const text = textarea.value;
  if (text !== '') {
    writeUserMsg(local.tag, local.username, text);
    ipcRenderer.send('local-text', tags, text); // send-text
    textarea.value = ''; // empty textarea
  }

  // 2. send files
  const files = Array.from(fileInput.files);
  files.forEach((file) => {
    ipcRenderer.send('local-file', tags, file.path);
    writeMsg(`>> 请求发送 ${file.name}……`);
  });
  fileInput.value = ''; // flush filenames
  filePath.innerHTML = '';
});

// login/apply settings
const settingsSubmitBtn = document.querySelector('#settings-submit');

function logout(opts = {}) {
  ipcRenderer.send('logout', opts);
}

function applySettings() {
  const { username, host, port, hostStart, hostEnd, portStart, portEnd, connects, login } = local;
  const options = { username, host, port, hostStart, hostEnd, portStart, portEnd, connects };

  const newImportant = { username, host, port, login };
  const keys = ['username', 'host', 'port', 'login'];
  if (important === null || keys.some(key => newImportant[key] !== important[key])) {
    ipcRenderer.send('setup', options);
  } else {
    ipcRenderer.send('change-setting', options);
  }
}

settingsSubmitBtn.addEventListener('click', applySettings);
logoutBtn.addEventListener('click', logout);

// binding settings
function handleChange(e) {
  const node = e.target;
  const value = node[node.dataset.valueKey || 'value'];
  if (node.dataset.state) state[node.dataset.state] = value;
}
document.querySelectorAll('.settings input[data-state]').forEach((input) => {
  input.addEventListener('change', handleChange);
});


(() => { // 调整字体大小
  const handleFontSizeChange = (e) => {
    const node = e.target;
    document.documentElement.style.setProperty(`--${node.id}`, `${node.value}${node.dataset.base}`);
  };
  const inputFontSize = document.querySelector('#input-font-size');
  inputFontSize.addEventListener('change', handleFontSizeChange);
  const viewFontSize = document.querySelector('#view-font-size');
  viewFontSize.addEventListener('change', handleFontSizeChange);
})();

(() => { // add connect template
  const connect = document.querySelector('#connects .connect-list li');
  connect.querySelector('.remove').addEventListener('click', removeConnect, false);
  template.connect = connect.cloneNode(true);
})();

function removeConnect(e) {
  const connect = e.target.parentNode;
  const connectList = connect.parentNode;
  connect.remove();
  if (connectList.children.length === 0) {
    addConnect(connectList);
  }
}

function addConnect(list) {
  const e = template.connect.cloneNode(true);
  e.querySelector('.remove').addEventListener('click', removeConnect, false);
  list.appendChild(e);
}

// add connects
document.querySelector('#connects .btn.add').addEventListener('click', (e) => {
  const connectList = e.target.nextElementSibling;
  addConnect(connectList);
});

// display setting when startup
location.href = '#settings';
