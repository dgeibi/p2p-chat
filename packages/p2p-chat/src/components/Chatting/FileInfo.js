import React from 'react'
import Card from './CustomCard'
import { formatName, formatSize } from '../../utils/format'

export default ({ filename, onClick, size, username }) =>
  <Card>
    <section>
      {formatName(filename)}
      <br />
      {formatSize(size)} by {formatName(username)}
    </section>
    <a onClick={onClick}>Accept</a>
  </Card>
