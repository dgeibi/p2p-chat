import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Button } from 'antd'

import LoginBtn from '../components/Settings/Login'
import { loginActions } from './SettingsRedux'
import { chatListActions } from './AsideRedux'
import { ConnectBtn } from '../components/Settings/Connect'
import { ConnectRangeBtn } from '../components/Settings/ConnectRange'
import './Settings.scss'

@connect(
  state => ({
    login: state.settings.login,
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
  }

  render() {
    return (
      <div styleName="settings">
        <LoginBtn
          visibleDefault
          componentProps={{ ...this.props.login, ...this.props.loginActions }}
        />{' '}
        {this.props.login.logined &&
          <span>
            <Button type="danger" onClick={this.logout} icon="disconnect" /> <ConnectBtn />{' '}
            <ConnectRangeBtn />
          </span>}
      </div>
    )
  }
}
