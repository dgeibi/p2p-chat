import React from 'react'
import { Button } from 'antd'
import Card from './CustomCard'

export default props =>
  <Card>
    {props.filename}
    <Button onClick={props.onClick}>Accept</Button>
  </Card>
