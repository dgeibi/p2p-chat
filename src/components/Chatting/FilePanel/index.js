import React, { Component } from 'react'

import { Alert } from 'antd'
import FileInfo from './FileInfo'
import FileReceive from './FileReceive'
import './FilePanel.scss'
import { cardTypes } from './constants'

const accept = ({ tag, channel }, id, checksum, acceptFile) => () => {
  acceptFile({
    id,
    tag,
    channel,
    checksum,
  })
}

class FilePanel extends Component {
  render() {
    const { files, acceptFile } = this.props
    const filesArr = Object.values(files)
    if (filesArr.length <= 0) return null
    return (
      <div styleName="filePanel">
        {filesArr.map((msg) => {
          const { type, errMsg, id, checksum, key, ...payload } = msg
          if (errMsg) return <Alert type="error" message={errMsg} />
          switch (type) {
            case cardTypes.RECEIVE:
              return <FileReceive key={id} {...payload} />
            case cardTypes.INFO:
              return (
                <FileInfo
                  key={id}
                  {...payload}
                  onClick={accept(payload, id, checksum, acceptFile)}
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
