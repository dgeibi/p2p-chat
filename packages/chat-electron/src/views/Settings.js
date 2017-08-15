import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { createConnectedBtn, Login } from '../components/Settings/Login'
import { loginActions } from './SettingsRedux'
import ConnectBtn from '../components/Settings/Connect'
import ConnectRangeBtn from '../components/Settings/ConnectRange'

const LoginBtn = createConnectedBtn(
  connect(
    state => ({
      ...state.settings.login,
    }),
    dispatch => ({
      loginAction: bindActionCreators(loginActions, dispatch),
    })
  )
)(Login)

export default class Settings extends Component {
  render() {
    return (
      <div>
        <LoginBtn visibleDefault />
        <ConnectBtn />
        <ConnectRangeBtn />
      </div>
    )
  }
}
