/* eslint-disable */

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
  const { id, type, payload } = msg
  if (payload.error) return <ErrorMessage message={payload.error} />
  switch (type) {
    case 'text':
      return <Text {...payload} />
    case 'file:send':
      return <FileSend {...payload} />
    default:
      break
  }
}

export default Messages
