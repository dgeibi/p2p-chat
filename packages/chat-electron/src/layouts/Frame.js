import React, { Component } from 'react'
import { Row, Col } from 'antd'
import SettingNav from '../views/Settings'
import Aside from '../views/Aside'
import './Frame.scss'

class Frame extends Component {
  render() {
    return (
      <main>
        <Row>
          <Col span={6} styleName="col col-1">
            <SettingNav />
            <Aside />
          </Col>
          <Col span={14} offset={2} styleName="col">
            {this.props.children}
          </Col>
        </Row>
      </main>
    )
  }
}

export default Frame
