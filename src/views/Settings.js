import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Button } from 'antd'
import PropTypes from 'prop-types'

import { loginActions } from './SettingsRedux'
import { chatListActions } from './AsideRedux'
import MyInfo from '../components/Settings/MyInfo'
import Login from '../components/Settings/Login'
import Connect from '../components/Settings/Connect'
import ConnectRange from '../components/Settings/ConnectRange'
import CreateChannel from '../components/Settings/CreateChannel'
import ModalBtn from './ModalBtn'

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
  static propTypes = {
    loginActions: PropTypes.shape({
      logout: PropTypes.func.isRequired,
      backToRoot: PropTypes.func.isRequired,
    }),
    resetChatList: PropTypes.func.isRequired,
    onlineUsers: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      })
    ).isRequired,
    login: PropTypes.shape({
      logined: PropTypes.bool.isRequired,
    }).isRequired,
  }
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
          <ModalBtn id="login" visibleDefault>
            {({ hide, visible }) => (
              <Login
                hide={hide}
                visible={visible}
                {...login}
                {...this.props.loginActions}
              />
            )}
          </ModalBtn>
        )}
        {logined && (
          <div>
            <ModalBtn id="connect">
              {({ show, hide, visible }) => (
                <span>
                  <Button onClick={show} icon="cloud-o" title="Connect clients" />
                  <Connect hide={hide} visible={visible} />
                </span>
              )}
            </ModalBtn>{' '}
            <ModalBtn id="connect-range">
              {({ show, hide, visible }) => (
                <span>
                  <Button onClick={show} icon="plus" title="Connect clients from range" />
                  <ConnectRange hide={hide} visible={visible} />
                </span>
              )}
            </ModalBtn>{' '}
            <ModalBtn id="create-channel">
              {({ show, hide, visible }) => (
                <span>
                  <Button onClick={show} icon="usergroup-add" title="Create a channel" />
                  <CreateChannel
                    hide={hide}
                    visible={visible}
                    onlineUsers={onlineUsers}
                  />
                </span>
              )}
            </ModalBtn>{' '}
            <Button
              type="danger"
              onClick={this.logout}
              icon="disconnect"
              title="Logout"
            />
          </div>
        )}
        <MyInfo {...login} />
      </div>
    )
  }
}
