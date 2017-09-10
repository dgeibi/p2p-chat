import React from 'react'
import Card from '../../Common/CustomCard'
import { formatName, formatSize } from '../../../utils/format'
import './FileReceive.scss'
import { fileLoadStates } from './constants'

export default ({ filename, onClick, size, username, status }) => (
  <Card>
    <span styleName="filename">{formatName(filename)}</span>
    <br />
    {formatSize(size)} by {formatName(username)}
    <br />
    <br />
    {fileLoadStates.waitting === status ? 'waiting to receive..' : <a onClick={onClick}>Accept</a>}
  </Card>
)
