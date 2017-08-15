import React, { Component } from 'react'
import SettingNav from '../views/Settings'

class Frame extends Component {
  render() {
    return (
      <div>
        <SettingNav />
        <main>
          {this.props.children}
        </main>
      </div>
    )
  }
}

export default Frame
