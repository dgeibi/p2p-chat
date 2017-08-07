/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "assets/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("electron");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("escape-html");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

const formatTag = tag => tag.slice(0, 5);

module.exports = formatTag;

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_electron__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_electron___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_electron__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_path__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_path___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_path__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_escape_html__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_escape_html___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_escape_html__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__view_index_css__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__view_index_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__view_index_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__view_formatTag__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__view_formatTag___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__view_formatTag__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__view_bind__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__view_bind___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__view_bind__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__actions_applySettings__ = __webpack_require__(11);
/* eslint-env browser */









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
  portEnd: 8090
};

const local = Object.assign({}, defaultConfig);
let important = null;

const bindLocal = __WEBPACK_IMPORTED_MODULE_5__view_bind___default.a.bind(null, local, 'local', defaultConfig);
bindLocal('username');
bindLocal('host');
bindLocal('port');
bindLocal('hostStart');
bindLocal('hostEnd');
bindLocal('portStart');
bindLocal('portEnd');
bindLocal('channel');
bindLocal('thechannelinput');

Object.defineProperty(local, 'connects', {
  get() {
    return Array.from(document.querySelectorAll('.connect-list li')).map(item => {
      const host = item.querySelector('[data-connect="host"]').value;
      const port = Math.trunc(item.querySelector('[data-connect="port"]').value);
      if (port) return { host, port };
      return undefined;
    }).filter(i => !!i);
  },
  set() {}
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
    if (!success) state.users = {};
  },

  get login() {
    return local.login;
  },

  set user({ tag, username, online = true }) {
    local.users[tag] = { tag, username, online };
    updateUsers(local.users);
  },

  get user() {
    return null;
  },

  set users(users) {
    local.users = users;
    updateUsers(local.users);
  },

  get users() {
    return local.users;
  },

  set channels(channels) {
    document.querySelector('[data-local="channel"]').innerHTML = '';
  }
};

function updateUsers(users) {
  aside.innerHTML = Object.values(users).map(user => `<div>
          <input type="checkbox" id="${user.tag}" checked>
          <label for="${user.tag}">${__WEBPACK_IMPORTED_MODULE_2_escape_html___default()(user.username)}[${__WEBPACK_IMPORTED_MODULE_4__view_formatTag___default()(user.tag)}]</label>
        </div>`).join('');
}

const { writeMonthDay, writeMsg, writeUserMsg, writeErrorMsg } = __webpack_require__(12)(view);

document.querySelector('#create-channel').addEventListener(() => {
  console.log(local.thechannelinput);
});

__WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].on('logout-reply', (event, { errMsg }) => {
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
__WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].on('setup-reply', (event, { errMsg, id }) => {
  writeMonthDay();
  const success = !errMsg;
  state.login = success;
  if (success) {
    Object.assign(local, id);
    const { username, host, port } = id;
    const login = true;
    important = { username, host, port, login };
    writeMsg('>> 登录成功');
    writeMsg(`>> 你好，${__WEBPACK_IMPORTED_MODULE_2_escape_html___default()(username)}[${__WEBPACK_IMPORTED_MODULE_4__view_formatTag___default()(local.tag)}].`);
    writeMsg(`>> 你的地址是${host || id.address}:${port}`);
  } else {
    writeErrorMsg('>> 登录失败');
    writeErrorMsg(`>> ${errMsg}`);
  }
});

__WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].on('before-setup', (event, { users, channels }) => {
  state.users = users;
  state.channels = channels;
});

__WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].on('login', (event, { tag, username }) => {
  writeMsg(`>> ${__WEBPACK_IMPORTED_MODULE_2_escape_html___default()(username)}[${__WEBPACK_IMPORTED_MODULE_4__view_formatTag___default()(tag)}] 已上线`);
  state.user = { tag, username };
});

__WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].on('logout', (event, { tag, username }) => {
  writeMsg(`>> ${__WEBPACK_IMPORTED_MODULE_2_escape_html___default()(username)}[${__WEBPACK_IMPORTED_MODULE_4__view_formatTag___default()(tag)}] 已下线`);
  state.user = { tag, username, online: false };
});

__WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].on('text', (event, { tag, username, text }) => {
  writeUserMsg(tag, username, text);
});

__WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].on('fileinfo', (event, { username, tag, filename, id, size }) => {
  writeMsg(`>> ${username}[${__WEBPACK_IMPORTED_MODULE_4__view_formatTag___default()(tag)}] 想发给你 ${filename}(${size} 字节)`, null, true);
  writeMsg(`<section data-file-accept-id="${id}">
    <a href="#" class="accept">确认接收${__WEBPACK_IMPORTED_MODULE_2_escape_html___default()(filename)}</a>
  </section>`);
  const link = document.querySelector(`[data-file-accept-id="${id}"] > .accept`);
  const checksum = id.split('.')[0];
  link.addEventListener('click', () => {
    const { channel } = local;
    __WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].send('accept-file', { tag, checksum, payload: { checksum, channel } });
    link.remove();
  });
});

__WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].on('file-receiced', (event, { tag, username, filename, filepath, id }) => {
  const fileSection = document.querySelector(`[data-file-id="${id}"]`);
  fileSection.innerHTML = `
    <section>>> 已收到 ${__WEBPACK_IMPORTED_MODULE_2_escape_html___default()(username)}[${__WEBPACK_IMPORTED_MODULE_4__view_formatTag___default()(tag)}] 发送的 ${__WEBPACK_IMPORTED_MODULE_2_escape_html___default()(filename)}</section>
    <section>
      <a href="#" class="open-file">打开文件</a>
      <a href="#" class="open-dir">打开文件所在目录</a>
    </section>
  `;
  fileSection.querySelector('.open-file').addEventListener('click', () => {
    __WEBPACK_IMPORTED_MODULE_0_electron__["shell"].openItem(filepath);
  });
  fileSection.querySelector('.open-dir').addEventListener('click', () => {
    __WEBPACK_IMPORTED_MODULE_0_electron__["shell"].openItem(__WEBPACK_IMPORTED_MODULE_1_path___default.a.dirname(filepath));
  });
});

__WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].on('file-sent', (event, { tag, username, filename }) => {
  writeMsg(`>> ${filename} 已发送给 ${username}[${__WEBPACK_IMPORTED_MODULE_4__view_formatTag___default()(tag)}]`, null, true);
});

__WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].on('file-send-fail', (event, { tag, username, filename, errMsg }) => {
  writeErrorMsg(`>> ${filename} 发送给 ${username}[${__WEBPACK_IMPORTED_MODULE_4__view_formatTag___default()(tag)}] 时出错`);
  writeErrorMsg(`>> ${errMsg}`);
});

__WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].on('file-unable-to-send', (event, { errMsg }) => {
  writeErrorMsg(`>> ${errMsg}`);
});

__WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].on('file-write-fail', (event, { tag, username, filename, id }) => {
  const fileSection = document.querySelector(`[data-file-id="${id}"]`);
  writeMsg(`>> ${username}[${__WEBPACK_IMPORTED_MODULE_4__view_formatTag___default()(tag)}] 发送的 ${filename} 接收失败。`, fileSection, true);
});

__WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].on('bg-err', (event, { errMsg }) => {
  writeErrorMsg('>> 后台出错了！');
  writeErrorMsg(`>> ${errMsg}`);
});

__WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].on('file-process-start', (event, { id }) => {
  writeMsg(`<div data-file-id="${id}" class="file-state">
    <div class="percent-bar"><div class="percent-bar-inner"></div></div>
    <span class="speed"></span>
  </div>`);
});

__WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].on('file-processing', (event, { id, percent, speed }) => {
  const fileSection = document.querySelector(`[data-file-id="${id}"]`);
  fileSection.querySelector('.percent-bar-inner').style.width = `${(percent * 100).toFixed(3)}%`;
  fileSection.querySelector('.speed').textContent = speed;
});

__WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].on('file-process-done', (event, { id }) => {
  const fileSection = document.querySelector(`[data-file-id="${id}"]`);
  fileSection.querySelector('.percent-bar-inner').style.width = '100%';
  fileSection.querySelector('.speed').textContent = '正在校验，请稍等...';
});

// 已选择的文件显示
const filePath = document.querySelector('.file-path');
const fileInput = document.querySelector('.file-input');
fileInput.addEventListener('change', function handleFilesChange() {
  const files = Array.from(this.files);
  filePath.innerHTML = files.map(file => `<li>${__WEBPACK_IMPORTED_MODULE_2_escape_html___default()(file.name)}</li>`).join('');
});

// handle chat message submit
chatMsgSubmitBtn.addEventListener('click', e => {
  e.preventDefault();

  // 0. get selected tags
  const tags = Array.from(aside.querySelectorAll('input[type=checkbox]')).filter(user => user.checked).map(user => user.id);

  const { channel } = local;
  // 1. send text
  const text = textarea.value;
  if (text !== '') {
    writeUserMsg(local.tag, local.username, channel + text);
    __WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].send('local-text', { tags, payload: { text, channel } }); // send-text
    textarea.value = ''; // empty textarea
  }

  // 2. send files
  const files = Array.from(fileInput.files);
  files.forEach(file => {
    __WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].send('local-file', { tags, filepath: file.path, payload: { channel } });
    writeMsg(`>> 请求发送 ${__WEBPACK_IMPORTED_MODULE_2_escape_html___default()(file.name)}……`);
  });
  fileInput.value = ''; // flush filenames
  filePath.innerHTML = '';
});

// login/apply settings
const settingsSubmitBtn = document.querySelector('#settings-submit');

function logout(opts = {}) {
  __WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].send('logout', opts);
}
settingsSubmitBtn.addEventListener('click', () => Object(__WEBPACK_IMPORTED_MODULE_6__actions_applySettings__["a" /* default */])({ important, local }));
logoutBtn.addEventListener('click', logout);

// binding settings
function handleChange(e) {
  const node = e.target;
  const value = node[node.dataset.valueKey || 'value'];
  if (node.dataset.state) state[node.dataset.state] = value;
}
document.querySelectorAll('.settings input[data-state]').forEach(input => {
  input.addEventListener('change', handleChange);
});(() => {
  // 调整字体大小
  const handleFontSizeChange = e => {
    const node = e.target;
    document.documentElement.style.setProperty(`--${node.id}`, `${node.value}${node.dataset.base}`);
  };
  const inputFontSize = document.querySelector('#input-font-size');
  inputFontSize.addEventListener('change', handleFontSizeChange);
  const viewFontSize = document.querySelector('#view-font-size');
  viewFontSize.addEventListener('change', handleFontSizeChange);
})();(() => {
  // add connect template
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
document.querySelector('#connects .btn.add').addEventListener('click', e => {
  const connectList = e.target.nextElementSibling;
  addConnect(connectList);
});

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(6);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(8)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./index.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./index.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(7)(undefined);
// imports


// module
exports.push([module.i, ":root {\n  --view-font-size: 16px;\n  --input-font-size: 16px;\n}\n\nhtml, body {\n  padding: 0;\n  margin: 0;\n}\n\nbody {\n  font-family: -apple-system, 'Helvetica Neue', Helvetica, 'PingFang SC', 'Microsoft YaHei', 'WenQuanYi Micro Hei', sans-serif;\n}\n\n.container {\n  box-sizing: border-box;\n  height: 100vh;\n  padding: 1rem;\n  display: flex;\n}\n\naside, .view, textarea {\n  border: 1px solid #e4e4d8;\n  border-radius: 4px;\n}\n\naside {\n  flex-basis: 20vw;\n  overflow: auto;\n}\n\nmain {\n  flex: 5;\n  display: flex;\n  flex-direction: column;\n  padding-right: 1rem;\n}\n\n.view {\n  font-size: var(--view-font-size);\n  padding: .5em;\n  flex-grow: 2;\n  flex-basis: 30vh;\n  overflow-y: auto;\n  margin-bottom: 2rem;\n}\n\n.input {\n  flex-grow: 1;\n}\n\ntextarea {\n  display: block;\n  resize: none;\n  box-sizing: border-box;\n  width: 100%;\n  font-size: var(--input-font-size);\n  font-family: inherit;\n  border-radius: .4em;\n  margin: 2px 0 0 0;\n  padding: .5em;\n  height: 20vh;\n}\n\ninput[type=range] {\n  margin: 0;\n}\n\nform > .submit {\n  margin-top: 1.5rem;\n  text-align: right;\n}\n\na {\n  color: cornflowerblue;\n  text-decoration: none;\n}\n\n.btn {\n  font-size: 14px;\n  color: white;\n  display: inline-block;\n  border-radius: 2px;\n  padding: .4em .5em;\n  cursor: pointer;\n  border: 1px solid #2e6da4;\n  background: hsla(219, 50%, 55%, 1);\n  user-select: none;\n}\n\n.btn:hover {\n  background: hsla(219, 66%, 57%, 1);\n}\n\n.top-bar {\n  padding: 10px;\n  user-select: none;\n}\n\n.top-bar > *:not(:last-child) {\n  margin-right: 1.5rem;\n}\n\n.pointer {\n  cursor: pointer;\n}\n\n.file-btn {\n  position: relative;\n  overflow: hidden;\n}\n\n.file-btn .file-input {\n  position: absolute;\n  top: 0;\n  right: 0;\n  margin: 0;\n  padding: 0;\n  font-size: 2em;\n  opacity: 0;\n  cursor: pointer;\n}\n\n.file-path {\n  padding-left: 10px;\n  margin: 0 0 1rem 0;\n  border-radius: 4px;\n  background: #d4c7c7;\n}\n\n.file-path > li {\n  list-style: none;\n}\n\nlabel {\n  font-size: 14px;\n  color: grey;\n}\n\n.v-center {\n  display: flex;\n  align-content: center;\n}\n\n\n/* https://codepen.io/imprakash/pen/GgNMXO?editors=1000 */\n\n.overlay {\n  position: fixed;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  background: rgba(0, 0, 0, 0.7);\n  transition: opacity 500ms;\n  visibility: hidden;\n  opacity: 0;\n}\n\n.overlay:target {\n  z-index: 99;\n  visibility: visible;\n  opacity: 1;\n}\n\n.select-none {\n  user-select: none;\n}\n\n.popup {\n  box-sizing: border-box;\n  margin: 70px auto;\n  padding: 10px;\n  background: #fff;\n  border-radius: 5px;\n  max-width: 500px;\n  height: 80%;\n  position: relative;\n  transition: all 5s ease-in-out;\n}\n\n.popup-close {\n  position: absolute;\n  top: 10px;\n  right: 10px;\n  transition: all 200ms;\n  font-size: 30px;\n  font-weight: bold;\n  text-decoration: none;\n  color: #333;\n}\n\n.popup-close:hover {\n  color: cornflowerblue;\n}\n\n.popup-content {\n  box-sizing: border-box;\n  padding-bottom: 45px;\n  height: 70%;\n  overflow: auto;\n}\n\n.settings label {\n  user-select: none;\n  display: inline-block;\n}\n\n.popup-header {\n  margin: 10px 0 30px;\n  padding: 0;\n  font-size: 1.3em;\n}\n\n#settings-submit {\n  position: absolute;\n  right: 10px;\n  bottom: 10px;\n}\n\n.setting-input {\n  margin-bottom: .6em;\n}\n\n.center {\n  text-align: center;\n}\n\n.hide {\n  display: none!important;\n}\n\n.info {\n  color: hsla(23, 30%, 55%, 1);\n  font-size: 0.9em;\n}\n\n.info.error {\n  color: red;\n}\n\nul {\n  list-style: none;\n}\n\nli {\n  margin-bottom: .4em;\n}\n\n.row {\n  position: relative;\n  margin-bottom: .4em;\n}\n\n.row input[type=text] {\n  position: absolute;\n  left: 80px;\n}\n\n.file-state {\n  margin: 2em 0;\n}\n\n.percent-bar {\n  background: grey;\n  width: 100%;\n  height: 1em;\n}\n\n.percent-bar-inner {\n  background: greenyellow;\n  width: 0%;\n  height: 100%;\n}\n", ""]);

// exports


/***/ }),
/* 7 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(9);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 9 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 10 */
/***/ (function(module, exports) {

/* eslint-env browser */
/* eslint-disable no-console */

function bind(object, dataKey, defaultObject = {}, key) {
  let cache = null;
  const query = () => {
    if (cache === null) {
      cache = document.querySelector(`[data-${dataKey}="${key}"]`);
    }
    return cache;
  };

  Object.defineProperty(object, key, {
    get() {
      const node = query();
      if (!node) {
        console.log(`get ${dataKey}: ${key} fail`);
        return defaultObject[key];
      }
      const value = node[node.dataset.valueKey || 'value'] || defaultObject[key];
      if (node.dataset.type === 'integer') return Math.trunc(value);
      if (node.dataset.type === 'number') return Number(value);
      return value;
    },
    set(value) {
      const node = query();
      if (node) node[node.dataset.valueKey || 'value'] = value;else console.log(`set ${dataKey}: ${key} fail`);
    }
  });
}

module.exports = bind;

/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = applySettings;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_electron__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_electron___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_electron__);


function applySettings({ important, local }) {
  const { username, host, port, hostStart, hostEnd, portStart, portEnd, connects, login } = local;

  const payload = {
    hostStart,
    hostEnd,
    portStart,
    portEnd,
    connects
  };

  const newImportant = { username, host, port, login };
  const keys = ['username', 'host', 'port', 'login'];
  if (important === null || keys.some(key => newImportant[key] !== important[key])) {
    const options = {
      username,
      host,
      port,
      payload
    };
    __WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].send('setup', options);
  } else {
    __WEBPACK_IMPORTED_MODULE_0_electron__["ipcRenderer"].send('change-setting', payload);
  }
}

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

/* eslint-disable no-param-reassign */

const dateFormat = __webpack_require__(13);
const formatTag = __webpack_require__(2);
const escapeHTML = __webpack_require__(1);

module.exports = view => {
  const write = (str, node) => {
    (node || view).insertAdjacentHTML('beforeend', str);
    if (node) return;
    setTimeout(() => {
      view.scrollTop = view.scrollHeight;
    }, 0);
  };

  const writeMonthDay = () => {
    write(`<section class="info center">${dateFormat(new Date(), 'mm-dd')}</section>`);
  };

  const writeMsg = (text, node, escape = false) => {
    write(`<section class="info">${escape ? escapeHTML(text) : text}</section>`, node);
  };

  const writeErrorMsg = text => {
    write(`<section class="info error">${escapeHTML(text)}</section>`);
  };

  const writeUserMsg = (tag, username, text) => {
    write(`<section><span class="info">${dateFormat(new Date(), 'HH:MM')} - ${escapeHTML(username)}[${formatTag(tag)}] :</span>${escapeHTML(text)}</section>`);
  };

  return {
    write,
    writeMonthDay,
    writeMsg,
    writeUserMsg,
    writeErrorMsg
  };
};

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("dateformat");

/***/ })
/******/ ]);