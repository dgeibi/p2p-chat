import React, { Component } from 'react'
import { Input, Button, Form, Upload, Icon } from 'antd'
import ErrorMessage from './ErrorMessage'
import Text from './Text'
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
        <div styleName="messages">
          {messages.map((msg) => {
            const props = { myName: username, key: Math.random() }
            if (msg.error) return <ErrorMessage message={msg.error} {...props} />
            if (msg.text) return <Text {...msg} {...props} />
            return null
          })}
        </div>
        <Upload
          multiple
          onRemove={this.handleFileRemove}
          beforeUpload={this.handleFileAdd}
          fileList={fileList}
        >
          <Button>
            <Icon type="upload" /> File
          </Button>
        </Upload>
        <Form onSubmit={this.handleSubmit}>
          <TextArea rows={4} value={text} onChange={this.handleTextChange} />
          <Button
            type="primary"
            htmlType="submit"
            disabled={!online || (!text && fileList.length <= 0)}
          >
            Send
          </Button>
        </Form>
      </div>
    )
  }
}

export default Dialog
