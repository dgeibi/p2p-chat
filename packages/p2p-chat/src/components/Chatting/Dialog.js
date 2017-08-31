import React, { Component } from 'react'
import { Input, Button, Form, Upload } from 'antd'
import Messages from './Messages'
import './Dialog.scss'

const { TextArea } = Input

class Dialog extends Component {
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
    const { messages, username, online, fileList, text } = this.props
    return (
      <div styleName="dialog">
        <Messages messages={messages} username={username} />
        <div>
          {this.props.children}
        </div>
        <Upload
          multiple
          onRemove={this.handleFileRemove}
          beforeUpload={this.handleFileAdd}
          fileList={fileList}
        >
          <Button shape="circle" icon="paper-clip" />
        </Upload>
        <Form onSubmit={this.handleSubmit}>
          <TextArea rows={4} value={text} onChange={this.handleTextChange} styleName="text" />
          <div styleName="send-btn-div">
            <Button
              type="primary"
              htmlType="submit"
              disabled={!online || (!text && fileList.length <= 0)}
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
