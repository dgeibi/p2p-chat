import React from 'react'
import { Progress } from 'antd'
import { shell } from 'electron'
import { dirname } from 'path'
import Card from './CustomCard'
import { formatName, formatSize, formatSpeed, formatPercent } from '../../utils/format'
import './FileReceive.scss'

const openFile = filepath => () => {
  shell.openItem(filepath)
}
const openDir = filepath => openFile(dirname(filepath))

const FileReceive = ({ username, size, filename, errMsg, speed, percent, ok, filepath }) => {
  let status

  if (ok) status = 'success'
  else if (errMsg) status = 'exception'
  else status = 'active'
  const name = formatName(filename)

  return (
    <Card>
      <span styleName="filename">{ok ? <a onClick={openFile(filepath)}>{name}</a> : name}</span>
      <br />
      {formatSize(size)} by {formatName(username)}
      <br />
      {status === 'active' && <span>{formatSpeed(speed)}</span>}
      {status === 'exception' && <div>{errMsg}</div>}
      <br />
      {status !== 'success' && <Progress percent={formatPercent(percent)} status={status} />}
      {status === 'success' && (
        <div>
          <a onClick={openDir(filepath)}>Show in folder</a>
        </div>
      )}
    </Card>
  )
}

export default FileReceive
