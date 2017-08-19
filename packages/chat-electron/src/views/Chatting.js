import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Dialog from '../components/Chatting/Dialog'
// import FilePanel from '../components/Chatting/FilePanel'
import * as actions from './ChattingRedux'

@connect(
  state => ({
    messages: getMessages(state.chatting.dialog),
    username: state.settings.login.username,
    dialog: state.chatting.dialog,
    filePanel: state.chatting.filePanel,
    routing: state.routing,
  }),
  dispatch => ({
    dialogActions: bindActionCreators(actions.dialogActions, dispatch),
    filePanelActions: bindActionCreators(actions.filePanelActions, dispatch),
  })
)
class Chatting extends Component {
  get id() {
    const { match } = this.props
    return match.params
  }

  render() {
    const { dialog, dialogActions, username, messages } = this.props
    const id = this.id

    return (
      <div>
        <Dialog {...dialogActions} {...dialog} id={id} username={username} messages={messages} />
      </div>
    )
  }
}

export default Chatting

function getMessages(dialogState) {
  const { type, key } = dialogState.id
  if (!type) return []
  const types = `${type}s`
  return dialogState[types][key] || []
}
