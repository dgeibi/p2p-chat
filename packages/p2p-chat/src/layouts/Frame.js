import React from 'react'
import { Row, Col } from 'antd'
import SettingNav from '../views/Settings'
import Aside from '../views/Aside'
import './Frame.scss'

const Frame = ({ children }) =>
  <main>
    <Row>
      <Col span={6} styleName="col col-1">
        <SettingNav />
        <Aside />
      </Col>
      <Col span={18} styleName="col">
        {children}
      </Col>
    </Row>
  </main>

export default Frame
