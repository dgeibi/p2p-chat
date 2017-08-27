import React, { Component } from 'react'
import { Input, Button, Form, Upload } from 'antd'
import Messages from './Messages'
import './Dialog.scss'

const { TextArea } = Input

class Dialog extends Component {
  state = {
    text: '',
    fileList: [],
  }

  handleTextChange = (e) => {
    this.setState({ text: e.target.value })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const { text, fileList } = this.state
    const { id } = this.props
    if (text) this.props.sendMessage(id, text)
    if (fileList.length > 0) {
      const filePaths = [...new Set(fileList.map(x => x.path))]
      this.props.sendFiles(id, filePaths)
    }
    this.setState({
      text: '',
      fileList: [],
    })
  }

  handleFileRemove = (file) => {
    this.setState(({ fileList }) => {
      const index = fileList.indexOf(file)
      const newFileList = fileList.slice()
      newFileList.splice(index, 1)
      return {
        fileList: newFileList,
      }
    })
  }

  handleFileAdd = (file) => {
    this.setState(({ fileList }) => ({
      fileList: [...fileList, file],
    }))
    return false
  }

  render() {
    const { messages, username, online } = this.props
    const { text, fileList } = this.state
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
