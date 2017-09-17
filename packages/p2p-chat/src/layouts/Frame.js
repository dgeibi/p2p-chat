import React from 'react'
import { Row, Col } from 'antd'
import PropTypes from 'prop-types'

import SettingNav from '../views/Settings'
import Aside from '../views/Aside'
import './Frame.scss'

const Frame = ({ children }) => (
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
)

Frame.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
}

export default Frame
