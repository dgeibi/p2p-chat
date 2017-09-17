import React, { Component } from 'react'
import { Menu } from 'antd'
import { ipcRenderer } from 'electron'
import PropTypes from 'prop-types'
import sortBy from 'lodash.sortby'
import isEqual from 'lodash.isequal'
import EventObservable from 'p2p-chat-utils/EventObservable'
import { formatTag } from '../../../utils/format'
import getInfo from '../../../selectors/chatInfo'
import ListItem from '../ListItem'
import DialogType from './DialogType'
import './ChatList.scss'

class ChatList extends Component {
  static propTypes = {
    current: PropTypes.shape({
      type: PropTypes.string,
      key: PropTypes.string,
    }),
    addUser: PropTypes.func.isRequired,
    offUser: PropTypes.func.isRequired,
    addChannel: PropTypes.func.isRequired,
    setup: PropTypes.func.isRequired,
    increaseBadge: PropTypes.func.isRequired,
    clearBadge: PropTypes.func.isRequired,
    changeDialog: PropTypes.func.isRequired,
    users: PropTypes.objectOf(
      PropTypes.shape({
        username: PropTypes.string,
        tag: PropTypes.string,
      })
    ).isRequired,
    channels: PropTypes.objectOf(
      PropTypes.shape({
        users: PropTypes.object,
      })
    ).isRequired,
    visible: PropTypes.bool.isRequired,
  }

  observables = EventObservable(ipcRenderer)

  componentWillMount() {
    const { addUser, offUser, addChannel, setup, increaseBadge } = this.props
    const { observe } = this.observables
    observe('login', (event, message) => {
      addUser(message)
    })

    observe('logout', (event, message) => {
      offUser(message)
    })

    observe('channel-create', (events, { channel }) => {
      addChannel(channel)
    })

    observe('after-setup', (event, { users, channels }) => {
      setup({ users, channels })
    })

    const handleIncome = (event, { tag, channel }) => {
      const currentID = this.props.current
      const id = idOf(tag, channel)
      if (!isEqual(id, currentID)) {
        increaseBadge(id, currentID)
      }
    }

    observe('fileinfo', handleIncome)
    observe('text', handleIncome)
  }

  componentWillUnmount() {
    this.observables.removeAllObservables()
  }

  componentWillReceiveProps(nextProps) {
    const currentID = this.props.current
    const nextID = nextProps.current

    if (nextID && nextID.type && !isEqual(currentID, nextID)) {
      this.props.clearBadge(nextID)
    }
  }

  handleClick = (e) => {
    const [key, type] = e.keyPath
    this.props.changeDialog(type, key)
  }

  render() {
    const { users: _users, channels: _channels, visible } = this.props
    if (!visible) {
      return null
    }

    const byOnline = key => (x) => {
      const prefix = x.online ? '0' : '1'
      return prefix + x[key]
    }

    const channels = sortBy(
      Object.keys(_channels).map(key =>
        getInfo({ users: _users, channels: _channels }, { type: DialogType.CHANNEL, key })
      ),
      byOnline('name')
    )

    const users = sortBy(Object.values(_users), byOnline('username'))

    return (
      <Menu
        mode="inline"
        defaultOpenKeys={[DialogType.CHANNEL, DialogType.USER]}
        onClick={this.handleClick}
        selectedKeys={[this.props.current.key]}
        styleName="menu"
      >
        <Menu.SubMenu key={DialogType.CHANNEL} title="Channels">
          {channels.map(({ key, name, badge, online }) => (
            <Menu.Item key={key}>
              <ListItem
                title={`${name}${formatTag(key)}`}
                badge={badge || 0}
                online={online}
              />
            </Menu.Item>
          ))}
        </Menu.SubMenu>
        <Menu.SubMenu key={DialogType.USER} title="Users">
          {users.map(({ tag: key, username: name, online, badge }) => (
            <Menu.Item key={key}>
              <ListItem
                title={`${name}${formatTag(key)}`}
                badge={badge || 0}
                online={online}
              />
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      </Menu>
    )
  }
}

export default ChatList

function idOf(tag, channel) {
  if (channel) {
    return { type: 'channel', key: channel }
  }
  return { type: 'user', key: tag }
}
