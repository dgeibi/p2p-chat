import { h, Component } from 'preact'
import Messages from './Messages'

class Dialog extends Component {
  render() {
    const { messages } = this.props
    return (
      <div>
        <Messages messages={messages} />
      </div>
    )
  }
}

export default Dialog
