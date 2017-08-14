import React, { Component } from 'react'
import Connect from './Connect'
import ConnectRange from './ConnectRange'
import Settings from './Settings'

class SettingsNav extends Component {
  render() {
    return (
      <div>
        <Settings />
        <Connect />
        <ConnectRange />
      </div>
    )
  }
}

export default SettingsNav
