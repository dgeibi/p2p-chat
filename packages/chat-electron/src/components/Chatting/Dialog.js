import React, { Component } from 'react'
import Messages from './Messages'

class Dialog extends Component {
  static defaultProps = {
    messages: [],
  }

  componentDidMount() {
    // this.props.fetchMessage(this.props.id)
  }

  render() {
    const { match } = this.props
    return (
      <p>
        {JSON.stringify(match.params)}
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
