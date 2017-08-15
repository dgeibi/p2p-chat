import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import LoginBtn from '../components/Settings/Login'
import { loginActions } from './SettingsRedux'
import { ConnectBtn } from '../components/Settings/Connect'
import { ConnectRangeBtn } from '../components/Settings/ConnectRange'

@connect(
  state => ({
    login: state.settings.login,
  }),
  dispatch => ({
    loginActions: bindActionCreators(loginActions, dispatch),
  })
)
export default class Settings extends Component {
  render() {
    return (
      <div>
        <LoginBtn
          visibleDefault
          componentProps={{ ...this.props.login, ...this.props.loginActions }}
        />
        <ConnectBtn />
        <ConnectRangeBtn />
      </div>
    )
  }
}
