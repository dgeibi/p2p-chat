import React, { Component } from 'react'
import ErrorMessage from './ErrorMessage'
import Text from './Text'
import './Messages.scss'

class Messages extends Component {
  saveMessageList = (div) => {
    this.messageList = div
  }

  scrollToBottom() {
    const scrollHeight = this.messageList.scrollHeight
    const height = this.messageList.clientHeight
    const maxScrollTop = scrollHeight - height
    this.messageList.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }

  shouldComponentUpdate(nextProps) {
    return this.props.messages.length !== nextProps.messages.length
  }

  render() {
    const { messages, username } = this.props
    return (
      <div styleName="messages" ref={this.saveMessageList}>
        {messages.map((msg) => {
          const props = { myName: username, key: msg.uid }
          if (msg.error) return <ErrorMessage message={msg.error} {...props} />
          if (msg.text) return <Text {...msg} {...props} />
          return null
        })}
      </div>
    )
  }
}

export default Messages
