import React, { Component } from 'react'

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
  const { id, type, payload } = msg
  if (payload.error) return <ErrorMessage message={payload.error} />
  switch (type) {
    case 'file:receive':
      return <FileReceive {...payload} />
    case 'file:info':
      return <FileInfo {...payload} />
    default:
      break
  }
}

export default FilePanel
