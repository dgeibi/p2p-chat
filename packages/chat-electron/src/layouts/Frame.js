import React, { Component } from 'react'
import { Row, Col } from 'antd'
import SettingNav from '../views/Settings'
import Aside from '../views/Aside'

class Frame extends Component {
  render() {
    return (
      <div>
        <SettingNav />
        <main>
          <Row>
            <Col span={6}>
              <Aside />
            </Col>
            <Col>
              {this.props.children}
            </Col>
          </Row>
        </main>
      </div>
    )
  }
}

export default Frame
