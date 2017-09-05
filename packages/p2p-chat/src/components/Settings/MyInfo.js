import React from 'react'
import { formatTag } from '../../utils/format'
import './MyInfo.scss'

export default ({ logined, tag, address, port, username }) =>
  (logined ? (
    <p styleName="my-info">
      {username}
      {formatTag(tag)}<br />
      {address}:{port}
    </p>
  ) : null)
