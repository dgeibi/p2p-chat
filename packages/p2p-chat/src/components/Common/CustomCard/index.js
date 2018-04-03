import React from 'react'
import { Card } from 'antd'

const style = {
  width: '150px',
  padding: '8px 10px',
  overflow: 'hidden',
}
export default props => <Card bodyStyle={style} {...props} />
