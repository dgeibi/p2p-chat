import React from 'react'
import PropTypes from 'prop-types'

import { formatTag } from '../../../utils/format'
import styles from './MyInfo.scss'

const MyInfo = ({ logined, tag, address, port, username }) =>
  logined ? (
    <p className={styles['my-info']}>
      {username}
      {formatTag(tag)}
      <br />
      {address}:{port}
    </p>
  ) : null

MyInfo.propTypes = {
  logined: PropTypes.bool.isRequired,
  tag: PropTypes.string,
  address: PropTypes.string,
  port: PropTypes.number,
  username: PropTypes.string,
}

export default MyInfo
