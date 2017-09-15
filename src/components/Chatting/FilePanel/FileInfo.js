import React from 'react'
import { Button } from 'antd'
import PropTypes from 'prop-types'

import Card from '../../Common/CustomCard'
import { formatName, formatSize } from '../../../utils/format'
import './FileReceive.scss'
import { fileLoadStates } from './constants'

const FileInfo = ({ filename, accept, ignore, size, username, status }) => (
  <Card>
    <span styleName="filename">{formatName(filename)}</span>
    <br />
    {formatSize(size)} by {formatName(username)}
    <br />
    <br />
    {fileLoadStates.waitting === status ? (
      'waiting to receive..'
    ) : (
      <span>
        <Button size="small" type="primary" onClick={accept}>
          Accept
        </Button>{' '}
        <Button size="small" type="danger" onClick={ignore}>
          Ignore
        </Button>
      </span>
    )}
  </Card>
)

FileInfo.propTypes = {
  username: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  filename: PropTypes.string.isRequired,
  status: PropTypes.string,
  accept: PropTypes.func,
  ignore: PropTypes.func,
}

export default FileInfo
