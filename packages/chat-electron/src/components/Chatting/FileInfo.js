import React from 'react'
import { Button } from 'antd'

export default props =>
  <div>
    {props.filename}
    <Button onClick={props.onClick}>Accept</Button>
  </div>
