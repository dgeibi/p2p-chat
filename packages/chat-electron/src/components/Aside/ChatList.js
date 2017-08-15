import React, { Component } from 'react'
import { Button } from 'antd'
import { ipcRenderer } from 'electron'
import DialogType from './DialogType'

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
    const { users, channels } = this.props
    return (
      <div>
        <h1>Channels</h1>
        {channels.map((channel) => {
          const { key, name } = channel
          return (
            <Button key={key} onClick={() => this.onClickChannel(key)}>
              {name}
            </Button>
          )
        })}
        <h1>Users</h1>
        {users.map((user) => {
          const { tag, name } = user
          return (
            <Button href="#" key={tag} onClick={() => this.onClickUser(tag)}>
              {name}
            </Button>
          )
        })}
      </div>
    )
  }
}

export default ChatList
