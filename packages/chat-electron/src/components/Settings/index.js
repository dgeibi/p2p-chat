import React, { Component } from 'react'
import { Col, Row } from 'antd'
import Connect from './Connect'
import ConnectRange from './ConnectRange'
import Settings from './Settings'

class SettingsNav extends Component {
  render() {
    return (
      <div>
        <Settings />
        <Connect />
        <ConnectRange type="dashed" />
      </div>
    )
  }
}

export default SettingsNav
