import React, { Component } from 'react'

import ErrorMessage from './ErrorMessage'
import FileInfo from './FileInfo'
import FileReceive from './FileReceive'
import './FilePanel.scss'

class FilePanel extends Component {
  render() {
    const { files, acceptFile } = this.props
    const filesArr = Object.values(files)
    if (filesArr.length <= 0) return null
    return (
      <div styleName="filePanel">
        {filesArr.map((msg) => {
          const { type, errMsg, id, ...payload } = msg
          if (errMsg) return <ErrorMessage message={errMsg} />
          switch (type) {
            case 'file:receive':
              return <FileReceive key={id} {...payload} />
            case 'file:info':
              return (
                <FileInfo
                  key={id}
                  {...payload}
                  onClick={() => {
                    const { tag, channel } = payload
                    const checksum = id.split('.')[0]
                    acceptFile({
                      id,
                      tag,
                      channel,
                      checksum,
                    })
                  }}
                />
              )
            default:
              return null
          }
        })}
      </div>
    )
  }
}

export default FilePanel
