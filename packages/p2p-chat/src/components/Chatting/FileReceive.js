import React from 'react'
import { Progress } from 'antd'
import { shell } from 'electron'
import { dirname } from 'path'
import Card from './CustomCard'
import { formatName, formatSize, formatSpeed, formatPercent } from '../../utils/format'

const FileReceive = ({ username, size, filename, errMsg, speed, percent, ok, filepath }) => {
  let status

  if (ok) status = 'success'
  else if (errMsg) status = 'exception'
  else status = 'active'

  const showFileName = ok
    ? <span>
      <a
        onClick={() => {
          shell.openItem(filepath)
        }}
        style={{
          fontWeight: 700,
        }}
      >
        {formatName(filename)}
      </a>
    </span>
    : <span>
      {formatName(filename)}
    </span>

  const showErrorMsg = errMsg
    ? <div>
      {errMsg}
    </div>
    : null

  const showOpenBtn = ok
    ? <div>
      <a
        size="small"
        onClick={() => {
          shell.openItem(dirname(filepath))
        }}
      >
          Show in folder
      </a>
    </div>
    : null

  const showSpeed =
    status === 'active'
      ? <section>
          speed: {formatSpeed(speed)}
      </section>
      : null

  return (
    <Card>
      <section>
        {showFileName} <br />
        {formatSize(size)} by {formatName(username)}
      </section>
      {showSpeed}
      {status !== 'success' && <Progress percent={formatPercent(percent)} status={status} />}
      {showOpenBtn}
      {showErrorMsg}
    </Card>
  )
}

export default FileReceive
