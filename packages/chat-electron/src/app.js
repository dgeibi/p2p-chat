import React from 'react'
import { render } from 'react-dom'
import { ipcRenderer } from 'electron'
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import { ConnectedRouter as Router } from 'react-router-redux'
import Settings from './components/Settings'
import { store, history } from './redux'

render(
  <Provider store={store}>
    <Router history={history}>
      <Switch>
        <Route path="/" component={Settings} />
      </Switch>
    </Router>
  </Provider>,
  document.querySelector('#root')
)

/*
// global
ipcRenderer.on('logout-reply', (event, { errMsg }) => {
  if (errMsg) {
    ipcRenderer.emit('bg-err', { errMsg })
  } else {
    store.dispatch(logout())
  }
})

ipcRenderer.on('setup-reply', (event, { errMsg, id }) => {
  if (!errMsg) {
    store.dispatch(updateSettings(id))
  } else {
    ipcRenderer.emit('bg-err', { errMsg })
  }
})

ipcRenderer.on('before-setup', (event, { users, channels }) => {
  store.dispatch(setupAside(users, channels))
})

ipcRenderer.on('bg-err', (event, { errMsg }) => {
  store.dispatch(showErrorPage(errMsg))
})

*/

/* after create: Frame aside chattinglist */
// ipcRenderer.on('login', (event, { tag, username }) => {
//   store.dispatch(addUser(username, tag))
// })

// ipcRenderer.on('logout', (event, { tag, username }) => {
//   store.dispatch(removeUser(username, tag))
// })

// ipcRenderer.on('channel-create', (events, { channel }) => {
//   store.dispatch(createChannel(channel))
// })

/*

// msg
ipcRenderer.on('text', (event, { tag, username, text, channel }) => {})

// file info
ipcRenderer.on('fileinfo', (event, { username, tag, filename, id, size }) => {})

// file:send
ipcRenderer.on('file-sent', (event, { tag, username, filename }) => {})
ipcRenderer.on('file-send-fail', (event, { tag, username, filename, errMsg }) => {})
ipcRenderer.on('file-unable-to-send', (event, { errMsg }) => {})

// file:receive
ipcRenderer.on('file-process-start', (event, { id }) => {})
ipcRenderer.on('file-processing', (event, { id, percent, speed }) => {})
ipcRenderer.on('file-process-done', (event, { id }) => {})
ipcRenderer.on('file-write-fail', (event, { tag, username, filename, id }) => {})
ipcRenderer.on('file-receiced', (event, { tag, username, filename, filepath, id }) => {})

*/
