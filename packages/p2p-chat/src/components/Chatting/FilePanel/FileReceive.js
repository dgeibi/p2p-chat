import React from 'react'
import { Progress } from 'antd'
import { shell } from 'electron'
import { dirname } from 'path'
import PropTypes from 'prop-types'

import Card from '../../Common/CustomCard'
import { fileLoadStates } from './constants'
import { formatSize, formatSpeed, formatPercent } from '../../../utils/format'
import './FileReceive.scss'

const openFile = filepath => () => {
  shell.openItem(filepath)
}
const openDir = filepath => openFile(dirname(filepath))

const { success, active, exception } = fileLoadStates

const FileReceive = ({
  username,
  size,
  filename,
  error,
  speed,
  percent,
  status,
  filepath,
}) => (
  <Card>
    <div styleName="card">
      <div styleName="filename" title={filename}>
        {status === success ? <a onClick={openFile(filepath)}>{filename}</a> : filename}
      </div>
      <div>
        {formatSize(size)} by <span title={username}>{username}</span>
      </div>
      {status === active && <div>{formatSpeed(speed)}</div>}
      {status === exception && <div>{error.message}</div>}
      {status !== success && (
        <Progress percent={formatPercent(percent)} status={status} />
      )}
      {status === success && (
        <div>
          <br />
          <a onClick={openDir(filepath)}>Show in folder</a>
        </div>
      )}
    </div>
  </Card>
)

FileReceive.propTypes = {
  username: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  filename: PropTypes.string.isRequired,
  error: PropTypes.object,
  speed: PropTypes.number,
  percent: PropTypes.number,
  status: PropTypes.string,
  filepath: PropTypes.string,
}

export default FileReceive
