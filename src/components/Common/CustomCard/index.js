import React from 'react'
import { Card } from 'antd'

export default props => (
  <Card
    bodyStyle={{
      width: '150px',
      padding: '8px 12px',
      overflow: 'hidden',
    }}
    {...props}
  />
)
