import React, { Component } from 'react'
import SettingNav from '../views/Settings'
import Aside from '../views/Aside'

class Frame extends Component {
  render() {
    return (
      <div>
        <SettingNav />
        <main>
          <Aside />
          {this.props.children}
        </main>
      </div>
    )
  }
}

export default Frame
