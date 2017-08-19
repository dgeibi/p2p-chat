import React from 'react'

const FileReceive = ({ username, filename, errMsg, speed, percent }) => {
  if (errMsg) {
    return (
      <div>
        <span>{username}</span> {errMsg}
      </div>
    )
  }
  return (
    <div>
      <span>{filename}</span>
      <span>{username}</span>
      speed: {showSpeed(speed)}
      percent: {showPercent(percent)}
    </div>
  )
}

export default FileReceive

function showSpeed(speed) {
  if (speed > 1e6) return `${speed / 1e6} MB/s`
  else if (speed > 1e3) return `${speed / 1e3} KB/s`
  return `${speed} B/s`
}

function showPercent(percent) {
  return `${(percent * 100).toFixed(3)}%`
}
