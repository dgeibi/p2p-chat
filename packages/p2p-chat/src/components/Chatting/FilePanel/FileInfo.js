import React from 'react'
import { Button } from 'antd'
import PropTypes from 'prop-types'

import Card from '../../Common/CustomCard'
import { formatSize } from '../../../utils/format'
import './FileReceive.scss'
import { fileLoadStates } from './constants'

const FileInfo = ({ filename, accept, ignore, size, username, status }) => (
  <Card>
    <div styleName="card">
      <div styleName="filename" title={filename}>
        {filename}
      </div>
      <div>
        {formatSize(size)} by <span title={username}>{username}</span>
      </div>
      {fileLoadStates.waitting === status ? (
        'waiting to receive..'
      ) : (
        <div>
          <br />
          <Button size="small" type="primary" onClick={accept}>
            Accept
          </Button>{' '}
          <Button size="small" type="danger" onClick={ignore}>
            Ignore
          </Button>
        </div>
      )}
    </div>
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
