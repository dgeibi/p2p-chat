import React, { Component } from 'react'
import { Input, Button, Form } from 'antd'
import ErrorMessage from './ErrorMessage'
import Text from './Text'
import './Dialog.scss'

const { TextArea } = Input

class Dialog extends Component {
  state = {
    text: '',
  }

  componentDidMount() {
    const { initStore, fetchMessages } = this.props
    initStore(this.props.id)
    fetchMessages(this.props.id)
  }

  componentWillReceiveProps(nextProps) {
    const { fetchMessages, initStore } = this.props
    if (nextProps.id.key !== this.props.id.key) {
      initStore(nextProps.id)
      fetchMessages(nextProps.id)
    }
  }

  handleTextChange = (e) => {
    this.setState({ text: e.target.value })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.sendMessage(this.props.id, this.state.text)

    this.setState({
      text: '',
    })
  }

  render() {
    const { messages, username } = this.props
    const { text } = this.state
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
        <Form onSubmit={this.handleSubmit}>
          <TextArea rows={4} value={text} onChange={this.handleTextChange} />
          <Button type="primary" htmlType="submit" disabled={!text}>
            Send
          </Button>
        </Form>
      </div>
    )
  }
}

export default Dialog
