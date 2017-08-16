import React, { Component } from 'react'
import { Spin } from 'antd'
import { ipcRenderer } from 'electron'
import DialogType from './DialogType'
import './ChatList.scss'

class ChatList extends Component {
  componentWillMount() {
    const { addUser, removeUser, addChannel } = this.props
    ipcRenderer.on('login', (event, { tag, username }) => {
      addUser(username, tag)
    })

    ipcRenderer.on('logout', (event, { tag, username }) => {
      removeUser(username, tag)
    })

    ipcRenderer.on('channel-create', (events, { channel }) => {
      addChannel(channel)
    })
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('login')
    ipcRenderer.removeAllListeners('logout')
    ipcRenderer.removeAllListeners('channel-create')
  }

  onClickChannel(key) {
    this.props.changeDialog(DialogType.CHANNEL, key)
  }

  onClickUser(key) {
    this.props.changeDialog(DialogType.USER, key)
  }

  render() {
    const { users, channels, visible } = this.props
    if (!visible) {
      return <Spin />
    }
    return (
      <div>
        <h1>Channels</h1>
        {Object.values(channels).map((channel) => {
          const { key, name } = channel
          return (
            <a key={key} onClick={() => this.onClickChannel(key)} styleName="item">
              {name}
            </a>
          )
        })}
        <h1>Users</h1>
        {Object.values(users).map((user) => {
          const { tag, username: name } = user
          return (
            <a key={tag} onClick={() => this.onClickUser(tag)} styleName="item">
              {name}
            </a>
          )
        })}
      </div>
    )
  }
}

export default ChatList
