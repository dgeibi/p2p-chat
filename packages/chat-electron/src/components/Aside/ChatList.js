import React, { Component } from 'react'
import { Spin, Menu } from 'antd'
import { ipcRenderer } from 'electron'
import PropTypes from 'prop-types'
import EventObservable from 'utils/EventObservable'
import formatTag from '../../utils/formatTag'
import DialogType from './DialogType'

class ChatList extends Component {
  static propTypes = {
    current: PropTypes.shape({
      type: PropTypes.string,
      key: PropTypes.string,
    }),
  }

  observables = EventObservable(ipcRenderer)

  componentWillMount() {
    const { addUser, offUser, addChannel, setup } = this.props
    this.observables.observe('login', (event, { tag, username }) => {
      addUser(username, tag)
    })

    this.observables.observe('logout', (event, { tag, username }) => {
      offUser(username, tag)
    })

    this.observables.observe('channel-create', (events, { channel }) => {
      addChannel(channel)
    })

    this.observables.observe('before-setup', (event, { users, channels }) => {
      setup({ users, channels })
    })
  }

  componentWillUnmount() {
    this.observables.removeAllObservables()
  }

  handleClick = (e) => {
    const [key, type] = e.keyPath
    this.props.changeDialog(type, key)
  }

  render() {
    const { users, channels, visible } = this.props
    if (!visible) {
      return <Spin />
    }

    return (
      <div>
        <Menu mode="inline" onClick={this.handleClick} selectedKeys={[this.props.current.key]}>
          <Menu.SubMenu key={DialogType.CHANNEL} title="Channels">
            {Object.values(channels).map((channel) => {
              const { key, name } = channel
              return (
                <Menu.Item key={key}>
                  {name}[{formatTag(key)}]
                </Menu.Item>
              )
            })}
          </Menu.SubMenu>
          <Menu.SubMenu key={DialogType.USER} title="Users">
            {Object.values(users).map((user) => {
              const { tag: key, username: name, online } = user
              return (
                <Menu.Item key={key} disabled={!online}>
                  {name}[{formatTag(key)}]
                </Menu.Item>
              )
            })}
          </Menu.SubMenu>
        </Menu>
      </div>
    )
  }
}

export default ChatList
