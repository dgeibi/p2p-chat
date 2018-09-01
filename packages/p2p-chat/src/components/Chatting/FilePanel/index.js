import React, { Component } from 'react'
import { Button } from 'antd'
import PropTypes from 'prop-types'

import FileInfo from './FileInfo'
import FileReceive from './FileReceive'
import styles from './FilePanel.scss'
import { cardTypes } from './constants'

const accept = ({ tag, channel }, id, checksum, acceptFile) => () => {
  acceptFile({
    id,
    tag,
    channel,
    checksum,
  })
}

const ignore = ({ tag, channel }, id, ignoreFile) => () => {
  ignoreFile({
    id,
    tag,
    channel,
  })
}

class FilePanel extends Component {
  static propTypes = {
    id: PropTypes.object.isRequired,
    clearPanel: PropTypes.func.isRequired,
    acceptFile: PropTypes.func.isRequired,
    ignoreFile: PropTypes.func.isRequired,
    files: PropTypes.object.isRequired,
  }

  clear = () => {
    const { clearPanel, id } = this.props
    clearPanel(id)
  }

  render() {
    const { files, acceptFile, ignoreFile } = this.props
    const filesArr = Object.values(files)
    if (filesArr.length <= 0) return null
    return (
      <div className={styles.filePanel}>
        <div className={styles.clearWrapper}>
          <Button onClick={this.clear} type="danger" shape="circle" icon="close" />
        </div>
        {filesArr.map(msg => {
          const { type, id, checksum, key, ...payload } = msg
          switch (type) {
            case cardTypes.RECEIVE:
              return <FileReceive key={id} {...payload} />
            case cardTypes.INFO:
              return (
                <FileInfo
                  key={id}
                  {...payload}
                  accept={accept(payload, id, checksum, acceptFile)}
                  ignore={ignore(payload, id, ignoreFile)}
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
