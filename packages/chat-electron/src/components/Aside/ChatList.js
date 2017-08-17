import React, { Component } from 'react'
import { Spin } from 'antd'
import { ipcRenderer } from 'electron'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import DialogType from './DialogType'
import './ChatList.scss'

class ChatList extends Component {
  static propTypes = {
    current: PropTypes.shape({
      type: PropTypes.string,
      key: PropTypes.string,
    }),
  }

  componentWillMount() {
    const { addUser, removeUser, addChannel, setup } = this.props
    ipcRenderer.on('login', (event, { tag, username }) => {
      addUser(username, tag)
    })

    ipcRenderer.on('logout', (event, { tag, username }) => {
      removeUser(username, tag)
    })

    ipcRenderer.on('channel-create', (events, { channel }) => {
      addChannel(channel)
    })

    ipcRenderer.on('before-setup', (event, { users, channels }) => {
      setup({ users, channels })
    })
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('login')
    ipcRenderer.removeAllListeners('logout')
    ipcRenderer.removeAllListeners('before-setup')
    ipcRenderer.removeAllListeners('channel-create')
  }

  onClickChannel(key) {
    this.props.changeDialog(DialogType.CHANNEL, key)
  }

  onClickUser(key) {
    this.props.changeDialog(DialogType.USER, key)
  }

  getOnClick(type) {
    const { changeDialog } = this.props

    return function onClick(e) {
      const node = e.target
      if (node.matches('a')) {
        changeDialog(type, node.dataset.key)
      }
    }
  }

  matchCurrent(type, key) {
    const { current } = this.props
    return type === current.type && current.key === key
  }

  render() {
    const { users, channels, visible } = this.props
    if (!visible) {
      return <Spin />
    }

    return (
      <div style={{ borderRight: '1px solid #eee' }}>
        <h1>Channels</h1>
        <ul onClick={this.getOnClick(DialogType.CHANNEL)}>
          {Object.values(channels).map((channel) => {
            const { key, name } = channel
            const styleName = classNames({
              item: true,
              item__active: this.matchCurrent(DialogType.CHANNEL, key),
            })
            return (
              <li key={key}>
                <a styleName={styleName} data-key={key}>
                  {name}
                </a>
              </li>
            )
          })}
        </ul>
        <h1>Users</h1>
        <ul onClick={this.getOnClick(DialogType.USER)}>
          {Object.values(users).map((user) => {
            const { tag: key, username: name } = user
            const styleName = classNames({
              item: true,
              item__active: this.matchCurrent(DialogType.USER, key),
            })
            return (
              <li key={key}>
                <a styleName={styleName} data-key={key}>
                  {name}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
}

export default ChatList
