import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Input, Button, Form, Upload, Collapse } from 'antd'
import Messages from '../Messages'
import { formatTag } from '../../../utils/format'
import './Dialog.scss'

const { TextArea } = Input
const { Panel } = Collapse

class Dialog extends Component {
  static propTypes = {
    setText: PropTypes.func.isRequired,
    id: PropTypes.object.isRequired,
    fileList: PropTypes.arrayOf(PropTypes.object).isRequired,
    sendFiles: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired,
    sendMessage: PropTypes.func.isRequired,
    removeFile: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired,
    messages: PropTypes.array.isRequired,
    username: PropTypes.string.isRequired,
    info: PropTypes.shape({
      online: PropTypes.bool,
      username: PropTypes.string,
      name: PropTypes.string,
      users: PropTypes.object,
    }).isRequired,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element),
    ]),
  }

  handleTextChange = (e) => {
    const { setText, id } = this.props
    const text = e.target.value
    setText(id, text)
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const { id, fileList, sendFiles, text, sendMessage, setText } = this.props
    if (text) {
      sendMessage(id, text)
      setText(id, '')
    }
    if (fileList.length > 0) {
      const filePaths = fileList.map(x => x.path)
      sendFiles(id, filePaths)
    }
  }

  handleFileRemove = (file) => {
    const { removeFile, id } = this.props
    removeFile(id, file.path)
  }

  handleFileAdd = (file) => {
    const { addFile, id } = this.props
    addFile(id, file.path)

    return false
  }

  render() {
    const { messages, username, fileList, text, info } = this.props
    return (
      <div styleName="dialog">
        {info.name && (
          <Collapse bordered={false}>
            <Panel
              header={`${info.name} (${info.onlineCount + 1}/${info.totalCount + 1})`}
            >
              <p>
                onlines: <span>{username}[me]</span>{' '}
                {Object.values(info.users)
                  .filter(x => x.online)
                  .map(x => (
                    <span key={x.tag}>
                      {x.username}
                      {formatTag(x.tag)}{' '}
                    </span>
                  ))}
              </p>
            </Panel>
          </Collapse>
        )}
        {info.username && (
          <section styleName="user-info">
            {info.username}
            {formatTag(info.tag)} ({info.online ? (
              `${info.host}:${info.port}`
            ) : (
              'Offline'
            )})
          </section>
        )}
        <Messages messages={messages} username={username} />
        <div>{this.props.children}</div>
        <Upload
          multiple
          onRemove={this.handleFileRemove}
          beforeUpload={this.handleFileAdd}
          fileList={fileList}
        >
          <Button shape="circle" icon="paper-clip" title="Send files" />
        </Upload>
        <Form onSubmit={this.handleSubmit}>
          <TextArea
            rows={4}
            value={text}
            onChange={this.handleTextChange}
            styleName="text"
          />
          <div styleName="send-btn-div">
            <Button
              type="primary"
              htmlType="submit"
              disabled={!info.online || (!text && fileList.length <= 0)}
            >
              Send
            </Button>
          </div>
        </Form>
      </div>
    )
  }
}

export default Dialog
