import React, { Component } from 'react'

class Messages extends Component {
  render() {
    const { messages } = this.props
    return (
      <div>
        {messages.map(mapper)}
      </div>
    )
  }
}

function mapper(msg) {
  const { type, payload } = msg
  if (payload.error) return <ErrorMessage message={payload.error} />
  switch (type) {
    case 'text':
      return <Text {...payload} />
    case 'file:send':
      return <FileSend {...payload} />
    default:
      return ''
  }
}

export default Messages
