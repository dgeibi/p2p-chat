import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Dialog from '../components/Chatting/Dialog'
import FilePanel from '../components/Chatting/FilePanel'
import * as actions from './ChattingRedux'
import './Chatting.scss'

@connect(
  (state, ownProps) => ({
    messages: getMessages(state.chatting.dialog, ownProps),
    files: getFiles(state.chatting.filePanel, ownProps),
    id: getIDObj(state.aside.chatList, ownProps),
    username: state.settings.login.username,
    routing: state.routing,
  }),
  dispatch => ({
    dialogActions: bindActionCreators(actions.dialogActions, dispatch),
    filePanelActions: bindActionCreators(actions.filePanelActions, dispatch),
  })
)
class Chatting extends Component {
  render() {
    const { dialogActions, username, messages, files, filePanelActions, id } = this.props
    return (
      <div styleName="chatting">
        <Dialog {...dialogActions} username={username} messages={messages} id={id} />
        <FilePanel {...filePanelActions} files={files} id={id} />
      </div>
    )
  }
}

export default Chatting

function getMessages(dialogState, ownProps) {
  const { type, key } = ownProps.match.params
  if (!type) return []
  return dialogState[type][key] || []
}

function getFiles(filePanelState, ownProps) {
  const { type, key } = ownProps.match.params
  if (!type) return {}
  return filePanelState[type][key] || {}
}

function getIDObj(chatListState, ownProps) {
  const { type, key } = ownProps.match.params
  const id = { type, key }
  if (!type) {
    id.tags = []
  } else if (type === 'channel') {
    id.tags = Object.keys(chatListState.channels[key].users)
    id.channel = key
  } else {
    id.tags = [key]
  }
  return id
}
