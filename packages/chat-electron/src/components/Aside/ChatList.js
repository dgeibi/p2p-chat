import React, { Component } from 'react'
import { ipcRenderer } from 'electron'
import DialogType from './DialogType'

class ChatList extends Component {
  onClickChannel = () => {
    this.props.changeDialog(DialogType.CHANNEL, this.key)
  }

  onClickUser = () => {
    this.props.changeDialog(DialogType.USER, this.key)
  }

  componentWillMount() {
    const { addUser, removeUser, createChannel } = this.props
    ipcRenderer.on('login', (event, { tag, username }) => {
      addUser(username, tag)
    })

    ipcRenderer.on('logout', (event, { tag, username }) => {
      removeUser(username, tag)
    })

    ipcRenderer.on('channel-create', (events, { channel }) => {
      createChannel(channel)
    })
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('login')
    ipcRenderer.removeAllListeners('logout')
    ipcRenderer.removeAllListeners('channel-create')
  }
  render() {
    const { users, channels } = this.props
    return (
      <div>
        <h1>Channels</h1>
        {channels.map((channel) => {
          const { key, name } = channel
          return (
            <a href="#" key={key} onClick={this.onClickChannel}>
              {name}
            </a>
          )
        })}
        <h1>Users</h1>
        {users.map((user) => {
          const { tag, name } = user
          return (
            <a href="#" key={tag} onClick={this.onClickUser}>
              {name}
            </a>
          )
        })}
      </div>
    )
  }
}

export default ChatList
