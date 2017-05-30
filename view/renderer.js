const dateFormat = require('dateformat');
const { ipcRenderer } = require('electron');

const view = document.querySelector('.view');
const aside = document.querySelector('aside');
const textarea = document.querySelector('textarea');
const loginBtn = document.querySelector('#login-btn');
const logoutBtn = document.querySelector('#logout-btn');
const fileBtn = document.querySelector('.file-btn');
const submitBtn = document.querySelector('#submit-btn');


const local = {
  msgCount: 0,
  username: '匿名',
  tag: null,
  users: null,
  login: false,
};
const formatTag = tag => tag.slice(0, 5);

const state = {
  set login(success) {
    local.login = success;
    local.msgCount = 0;
    loginBtn.innerHTML = success ? '改名' : '登录';
    logoutBtn.classList[success ? 'remove' : 'add']('hide');
    fileBtn.classList[success ? 'remove' : 'add']('hide');
    submitBtn.classList[success ? 'remove' : 'add']('hide');
    aside.classList[success ? 'remove' : 'add']('hide');
    if (!success) state.users = [];
  },
  set users(users) {
    local.users = users;
    aside.innerHTML = users.map(user => `<div><input type="checkbox" id="${user.tag}" checked><label for="${user.tag}">${user.username}[${formatTag(user.tag)}]</label></div>`).join('');
  },
};

const write = (str) => {
  view.insertAdjacentHTML('beforeend', str);
  setTimeout(() => {
    view.scrollTop = view.scrollHeight;
  }, 0);
};

const writeMonthDay = () => {
  write(`<section class="info center">${dateFormat(new Date(), 'mm-dd')}</section>`);
};

const writeTime = () => {
  write(`<section class="info center">${dateFormat(new Date(), 'HH:MM')}</section>`);
};

const writeMsg = (text) => {
  write(`<section class="info">${text}</section>`);
};

const writeUserMsg = (tag, username, text) => {
  if (local.msgCount % 5 === 0) writeTime();
  local.msgCount += 1;
  write(`<section><span class="info">${username}[${formatTag(tag)}]:</span> ${text}</section>`);
};


// 已选择的文件显示
const filePath = document.querySelector('.file-path');
const fileInput = document.querySelector('.file-input');
fileInput.addEventListener('change', () => {
  const files = Array.from(fileInput.files);
  filePath.innerHTML = files.map(file => `<li>${file.name}</li>`).join('');
});


// handle text submit
submitBtn.addEventListener('click', (e) => {
  const tags = Array.from(aside.querySelectorAll('input[type=checkbox]'))
    .filter(user => user.checked)
    .map(user => user.id);
  e.preventDefault();
  const text = textarea.value;
  if (text !== '') {
    writeUserMsg(local.tag, local.username, text);
    ipcRenderer.send('local-text', tags, text); // send-text
  }
  textarea.value = ''; // empty textarea

  // send to main process
  const files = Array.from(fileInput.files);
  files.forEach((file) => {
    ipcRenderer.send('local-file', tags, file.path);
    writeMsg(`>> 请求发送 ${file.name}……`);
  });

  // flush filenames
  fileInput.value = '';
  filePath.innerHTML = '';
});

// login/change username
const usernameInput = document.querySelector('#username');
const usernameSubmitBtn = document.querySelector('#username-submit');
const logout = (opts = {}) => {
  ipcRenderer.send('logout', opts);
};
const login = () => {
  local.username = usernameInput.value || local.username;
  ipcRenderer.send('setup', local.username);
};

usernameSubmitBtn.addEventListener('click', () => {
  if (local.login) logout({ reload: true });
  else login();
});
logoutBtn.addEventListener('click', logout);

ipcRenderer.on('logout-reply', (event, success, opts) => {
  writeMsg(`>> 登出${success ? '成功' : '失败'}`);
  state.login = !success;
  if (opts.reload) login();
});

// handle reply
ipcRenderer.on('setup-reply', (event, success, tag) => {
  writeMonthDay();
  writeMsg(`>> 登录${success ? '成功' : '失败'}`);
  state.login = success;
  if (success) {
    local.tag = tag;
    writeMsg(`>> 你好，${local.username}[${formatTag(local.tag)}].`);
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

ipcRenderer.on('file-accepted', (event, tag, username, filename) => {
  writeMsg(`>> ${username}[${formatTag(tag)}] 同意接收 ${filename}`);
});

ipcRenderer.on('file-write-fail', (event, message) => {
  const { tag, username, filename } = message;
  writeMsg(`>> ${username}[${formatTag(tag)}] 发送的 ${filename} 接收失败。`);
});

// 字体大小
const handleFontSizeChange = (e) => {
  const target = e.target;
  document.documentElement.style.setProperty(`--${target.id}`, `${target.value}${target.dataset.base}`);
};
const inputFontSize = document.querySelector('#input-font-size');
inputFontSize.addEventListener('change', handleFontSizeChange);
const viewFontSize = document.querySelector('#view-font-size');
viewFontSize.addEventListener('change', handleFontSizeChange);
