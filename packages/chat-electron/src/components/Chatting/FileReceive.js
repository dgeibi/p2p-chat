import React from 'react'
import { Progress } from 'antd'
import { shell } from 'electron'
import { dirname } from 'path'
import Card from './CustomCard'

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
        {cutName(filename)}
      </a>
    </span>
    : <span>
      {cutName(filename)}
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
        {formatSize(size)} by {cutName(username)}
      </section>
      {showSpeed}
      <Progress percent={formatPercent(percent)} status={status} />
      {showOpenBtn}
      {showErrorMsg}
    </Card>
  )
}

export default FileReceive

function formatSize(size) {
  if (size > 1e9) return `${cutdown(size / 1e9)} GB`
  else if (size > 1e6) return `${cutdown(size / 1e6)} MB`
  else if (size > 1e3) return `${cutdown(size / 1e3)} KB`
  return `${cutdown(size)} B`
}

function formatSpeed(speed) {
  return `${formatSize(speed)}/s`
}

function cutdown(str) {
  const strArr = String(str).split('.')
  if (strArr.length < 2) return str
  strArr[1] = strArr[1].slice(0, 2)
  return strArr.join('.')
}

function formatPercent(percent) {
  return (percent * 100).toFixed(3)
}

function cutName(str) {
  if (str.length > 30) {
    return `${str.slice(0, 10)}...${str.slice(-10)}`
  }
  return str
}
