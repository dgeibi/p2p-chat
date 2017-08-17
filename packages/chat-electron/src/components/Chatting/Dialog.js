import React, { Component } from 'react'
import Messages from './Messages'

class Dialog extends Component {
  static defaultProps = {
    messages: [],
  }

  componentDidMount() {
    this.props.fetchMessages(this.props.id)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.id.key !== this.props.id.key) this.props.fetchMessages(nextProps.id)
  }

  render() {
    return (
      <p>
        {JSON.stringify(this.props.id)}
      </p>
    )
    // const { messages } = this.props
    // if (messages.length <= 0) return <p> Nothing </p>
    // return (
    //   <div>
    //     <Messages messages={messages} />
    //   </div>
    // )
  }
}

export default Dialog
