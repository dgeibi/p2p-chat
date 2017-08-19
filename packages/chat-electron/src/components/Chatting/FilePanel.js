import React, { Component } from 'react'
import ErrorMessage from './ErrorMessage'
import FileInfo from './FileInfo'
import FileReceive from './FileReceive'

class FilePanel extends Component {
  render() {
    const { files } = this.props
    return (
      <div>
        {Object.values(files).map(mapper)}
      </div>
    )
  }
}

function mapper(msg) {
  const { type, errMsg, id, ...payload } = msg
  if (errMsg) return <ErrorMessage message={errMsg} />
  switch (type) {
    case 'file:receive':
      return <FileReceive key={id} {...payload} />
    case 'file:info':
      return <FileInfo key={id} {...payload} />
    default:
      return null
  }
}

export default FilePanel
