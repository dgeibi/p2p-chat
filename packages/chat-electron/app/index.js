/* eslint-env browser */
/* eslint-disable no-param-reassign */

import { ipcRenderer, shell } from 'electron'
import path from 'path'
import escapeHTML from 'escape-html'

import './view/index.css'
import formatTag from './view/formatTag'
import bind from './view/bind'
import applySettings from './actions/applySettings'

const view = document.querySelector('.view')
const aside = document.querySelector('aside')
const textarea = document.querySelector('textarea')
const loginBtn = document.querySelector('#login-btn')
const logoutBtn = document.querySelector('#logout-btn')
const fileBtn = document.querySelector('.file-btn')
const chatMsgSubmitBtn = document.querySelector('#submit-btn')

const template = {}

const defaultConfig = {
  msgCount: 0,
  username: null,
  tag: null,
  users: null,
  login: false,
  port: 8087,
  portStart: 8087,
  portEnd: 8090,
}

const local = Object.assign({}, defaultConfig)
let important = null

const bindLocal = bind.bind(null, local, 'local', defaultConfig)
bindLocal('username')
bindLocal('host')
bindLocal('port')
bindLocal('hostStart')
bindLocal('hostEnd')
bindLocal('portStart')
bindLocal('portEnd')
bindLocal('channel')
bindLocal('thechannelinput')

Object.defineProperty(local, 'connects', {
  get() {
    return Array.from(document.querySelectorAll('.connect-list li'))
      .map((item) => {
        const host = item.querySelector('[data-connect="host"]').value
        const port = Math.trunc(item.querySelector('[data-connect="port"]').value)
        if (port) return { host, port }
        return undefined
      })
      .filter(i => !!i)
  },
  set() {},
})

const state = {
  set login(success) {
    local.login = success
    local.msgCount = 0
    loginBtn.innerHTML = success ? '设置' : '登录'
    logoutBtn.classList[success ? 'remove' : 'add']('hide')
    fileBtn.classList[success ? 'remove' : 'add']('hide')
    chatMsgSubmitBtn.classList[success ? 'remove' : 'add']('hide')
    aside.classList[success ? 'remove' : 'add']('hide')
    if (!success) state.users = {}
  },

  get login() {
    return local.login
  },

  set user({ tag, username, online = true }) {
    local.users[tag] = { tag, username, online }
    updateUsers(local.users)
  },

  set users(users) {
    local.users = users
    updateUsers(local.users)
  },

  get users() {
    return local.users
  },

  set channels(channels) {
    local.channels = channels
    const strs = Object.values(channels).map(
      ({ name, key }) => `<option value="${key}">${name}</option>`
    )
    strs.unshift('<option value="">默认</option>')
    document.querySelector('[data-local="channel"]').innerHTML = strs.join('')
  },

  set channel(channel) {
    const { key } = channel
    local.channels[key] = channel
    state.channels = local.channels
  },
}

function updateUsers(users) {
  aside.innerHTML = Object.values(users)
    .map(
      user =>
        `<div ${user.online ? '' : 'class="offline"'}>
          <input type="checkbox" id="${user.tag}" checked>
          <label for="${user.tag}">${escapeHTML(user.username)}[${formatTag(user.tag)}]</label>
        </div>`
    )
    .join('')
}

const { writeMonthDay, writeMsg, writeUserMsg, writeErrorMsg } = require('./view/write.js')(view)

document.querySelector('#create-channel').addEventListener('click', () => {
  const tags = Array.from(aside.querySelectorAll('input[type=checkbox]'))
    .filter(user => user.checked)
    .map(user => user.id)
  ipcRenderer.send('create-channel', { tags, name: local.thechannelinput })
})

document.querySelector('[data-local="channel"]').addEventListener('change', function onchange() {
  if (this.value) {
    const { users } = local.channels[this.value]
    Array.from(aside.querySelectorAll('input[type=checkbox]')).forEach((node) => {
      node.checked = !!users[node.id]
    })
  }
})

ipcRenderer.on('logout-reply', (event, { errMsg }) => {
  const success = !errMsg
  if (success) {
    writeMsg('>> 登出成功')
    state.login = false
  } else {
    writeErrorMsg('>> 登出失败！')
    writeErrorMsg(`>> ${errMsg}`)
  }
})

// handle reply
ipcRenderer.on('setup-reply', (event, { errMsg, id }) => {
  writeMonthDay()
  const success = !errMsg
  state.login = success
  if (success) {
    Object.assign(local, id)

    const { username, host, port } = id
    const login = true
    important = { username, host, port, login }
    writeMsg('>> 登录成功')
    writeMsg(`>> 你好，${escapeHTML(username)}[${formatTag(local.tag)}].`)
    writeMsg(`>> 你的地址是${host || id.address}:${port}`)

    // set settings
  } else {
    writeErrorMsg('>> 登录失败')
    writeErrorMsg(`>> ${errMsg}`)
  }
})

ipcRenderer.on('before-setup', (event, { users, channels }) => {
  state.users = users
  state.channels = channels
})

ipcRenderer.on('login', (event, { tag, username }) => {
  writeMsg(`>> ${escapeHTML(username)}[${formatTag(tag)}] 已上线`)
  state.user = { tag, username }
})

ipcRenderer.on('logout', (event, { tag, username }) => {
  writeMsg(`>> ${escapeHTML(username)}[${formatTag(tag)}] 已下线`)
  state.user = { tag, username, online: false }
})

ipcRenderer.on('text', (event, { tag, username, text, channel }) => {
  writeUserMsg(tag, username, `${getChannelName(channel)} ${text}`)
})

ipcRenderer.on('channel-create', (events, { channel }) => {
  state.channel = channel
})

ipcRenderer.on('fileinfo', (event, { username, tag, filename, id, size }) => {
  writeMsg(`>> ${username}[${formatTag(tag)}] 想发给你 ${filename}(${size} 字节)`, null, true)
  writeMsg(`<section data-file-accept-id="${id}">
    <a href="#" class="accept">确认接收${escapeHTML(filename)}</a>
  </section>`)
  const link = document.querySelector(`[data-file-accept-id="${id}"] > .accept`)
  const checksum = id.split('.')[0]
  link.addEventListener('click', () => {
    const { channel } = local
    ipcRenderer.send('accept-file', { tag, checksum, payload: { checksum, channel } })
    link.remove()
  })
})

ipcRenderer.on('file-receiced', (event, { tag, username, filename, filepath, id }) => {
  const fileSection = document.querySelector(`[data-file-id="${id}"]`)
  fileSection.innerHTML = `
    <section>>> 已收到 ${escapeHTML(username)}[${formatTag(tag)}] 发送的 ${escapeHTML(filename)}</section>
    <section>
      <a href="#" class="open-file">打开文件</a>
      <a href="#" class="open-dir">打开文件所在目录</a>
    </section>
  `
  fileSection.querySelector('.open-file').addEventListener('click', () => {
    shell.openItem(filepath)
  })
  fileSection.querySelector('.open-dir').addEventListener('click', () => {
    shell.openItem(path.dirname(filepath))
  })
})

ipcRenderer.on('file-sent', (event, { tag, username, filename }) => {
  writeMsg(`>> ${filename} 已发送给 ${username}[${formatTag(tag)}]`, null, true)
})

ipcRenderer.on('file-send-fail', (event, { tag, username, filename, errMsg }) => {
  writeErrorMsg(`>> ${filename} 发送给 ${username}[${formatTag(tag)}] 时出错`)
  writeErrorMsg(`>> ${errMsg}`)
})

ipcRenderer.on('file-unable-to-send', (event, { errMsg }) => {
  writeErrorMsg(`>> ${errMsg}`)
})

ipcRenderer.on('file-write-fail', (event, { tag, username, filename, id }) => {
  const fileSection = document.querySelector(`[data-file-id="${id}"]`)
  writeMsg(`>> ${username}[${formatTag(tag)}] 发送的 ${filename} 接收失败。`, fileSection, true)
})

ipcRenderer.on('bg-err', (event, { errMsg }) => {
  writeErrorMsg('>> 后台出错了！')
  writeErrorMsg(`>> ${errMsg}`)
})

ipcRenderer.on('file-process-start', (event, { id }) => {
  writeMsg(`<div data-file-id="${id}" class="file-state">
    <div class="percent-bar"><div class="percent-bar-inner"></div></div>
    <span class="speed"></span>
  </div>`)
})

ipcRenderer.on('file-processing', (event, { id, percent, speed }) => {
  const fileSection = document.querySelector(`[data-file-id="${id}"]`)
  fileSection.querySelector('.percent-bar-inner').style.width = `${(percent * 100).toFixed(3)}%`
  fileSection.querySelector('.speed').textContent = speed
})

ipcRenderer.on('file-process-done', (event, { id }) => {
  const fileSection = document.querySelector(`[data-file-id="${id}"]`)
  fileSection.querySelector('.percent-bar-inner').style.width = '100%'
  fileSection.querySelector('.speed').textContent = '正在校验，请稍等...'
})

// 已选择的文件显示
const filePath = document.querySelector('.file-path')
const fileInput = document.querySelector('.file-input')
fileInput.addEventListener('change', function handleFilesChange() {
  const files = Array.from(this.files)
  filePath.innerHTML = files.map(file => `<li>${escapeHTML(file.name)}</li>`).join('')
})

// handle chat message submit
chatMsgSubmitBtn.addEventListener('click', (e) => {
  e.preventDefault()

  // 0. get selected tags
  const tags = Array.from(aside.querySelectorAll('input[type=checkbox]'))
    .filter(user => user.checked)
    .map(user => user.id)

  const { channel } = local
  // 1. send text
  const text = textarea.value
  if (text !== '') {
    writeUserMsg(local.tag, local.username, `${getChannelName(channel)} ${text}`)
    ipcRenderer.send('local-text', { tags, payload: { text, channel } }) // send-text
    textarea.value = '' // empty textarea
  }

  // 2. send files
  const files = Array.from(fileInput.files)
  files.forEach((file) => {
    ipcRenderer.send('local-file', { tags, filepath: file.path, payload: { channel } })
    writeMsg(`>> 请求发送 ${escapeHTML(file.name)}……`)
  })
  fileInput.value = '' // flush filenames
  filePath.innerHTML = ''
})

// login/apply settings
const settingsSubmitBtn = document.querySelector('#settings-submit')

function logout(opts = {}) {
  ipcRenderer.send('logout', opts)
}
settingsSubmitBtn.addEventListener('click', () => applySettings({ important, local }))
logoutBtn.addEventListener('click', logout)

// binding settings
function handleChange(e) {
  const node = e.target
  const value = node[node.dataset.valueKey || 'value']
  if (node.dataset.state) state[node.dataset.state] = value
}
document.querySelectorAll('.settings input[data-state]').forEach((input) => {
  input.addEventListener('change', handleChange)
})
;(() => {
  // 调整字体大小
  const handleFontSizeChange = (e) => {
    const node = e.target
    document.documentElement.style.setProperty(`--${node.id}`, `${node.value}${node.dataset.base}`)
  }
  const inputFontSize = document.querySelector('#input-font-size')
  inputFontSize.addEventListener('change', handleFontSizeChange)
  const viewFontSize = document.querySelector('#view-font-size')
  viewFontSize.addEventListener('change', handleFontSizeChange)
})()
;(() => {
  // add connect template
  const connect = document.querySelector('#connects .connect-list li')
  connect.querySelector('.remove').addEventListener('click', removeConnect, false)
  template.connect = connect.cloneNode(true)
})()

function removeConnect(e) {
  const connect = e.target.parentNode
  const connectList = connect.parentNode
  connect.remove()
  if (connectList.children.length === 0) {
    addConnect(connectList)
  }
}

function addConnect(list) {
  const e = template.connect.cloneNode(true)
  e.querySelector('.remove').addEventListener('click', removeConnect, false)
  list.appendChild(e)
}

// add connects
document.querySelector('#connects .btn.add').addEventListener('click', (e) => {
  const connectList = e.target.nextElementSibling
  addConnect(connectList)
})

function getChannelName(channel) {
  if (!local.channels) return ''
  if (!local.channels[channel]) return ''
  return local.channels[channel].name || ''
}
