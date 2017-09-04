import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Button } from 'antd'

import LoginBtn from '../components/Settings/Login'
import MyInfo from '../components/Settings/MyInfo'
import { loginActions } from './SettingsRedux'
import { chatListActions } from './AsideRedux'
import { ConnectBtn } from '../components/Settings/Connect'
import { ConnectRangeBtn } from '../components/Settings/ConnectRange'
import { CreateChannelModalBtn } from '../components/Settings/CreateChannel'

import { formatTag } from '../utils/format'
import './Settings.scss'

const selectOnlineUsers = chatListState =>
  Object.values(chatListState.users)
    .filter(({ online }) => online)
    .map(({ tag, username }) => ({
      label: username + formatTag(tag),
      value: tag,
    }))

@connect(
  state => ({
    login: state.settings.login,
    onlineUsers: selectOnlineUsers(state.aside.chatList),
  }),
  dispatch => ({
    resetChatList: () => dispatch(chatListActions.reset()),
    loginActions: bindActionCreators(loginActions, dispatch),
  })
)
export default class Settings extends Component {
  logout = () => {
    this.props.loginActions.logout()
    this.props.resetChatList()
    this.props.loginActions.backToRoot()
  }

  render() {
    const { onlineUsers, login } = this.props
    const { logined } = login
    return (
      <div styleName="settings">
        {!logined && (
          <LoginBtn visibleDefault componentProps={{ ...login, ...this.props.loginActions }} />
        )}
        {logined && (
          <div>
            <Button type="danger" onClick={this.logout} icon="disconnect" /> <ConnectBtn />{' '}
            <ConnectRangeBtn /> <CreateChannelModalBtn componentProps={{ onlineUsers }} />
          </div>
        )}
        <MyInfo {...login} />
      </div>
    )
  }
}
