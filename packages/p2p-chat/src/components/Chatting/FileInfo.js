import React from 'react'
import Card from './CustomCard'
import { formatName, formatSize } from '../../utils/format'
import './FileReceive.scss'

export default ({ filename, onClick, size, username }) =>
  <Card>
    <section>
      <span styleName="filename">{formatName(filename)}</span>
      <br />
      {formatSize(size)} by {formatName(username)}
    </section>
    <a onClick={onClick}>Accept</a>
  </Card>
