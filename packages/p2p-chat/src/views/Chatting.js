import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { basename } from 'path'

import Dialog from '../components/Chatting/Dialog'
import FilePanel from '../components/Chatting/FilePanel'
import * as actions from './ChattingRedux'

const fileMapper = filepath => ({
  uid: filepath,
  path: filepath,
  name: basename(filepath),
})
@connect(
  (state, ownProps) => {
    const { dialog, filePanel } = state.chatting
    const { chatList } = state.aside
    return {
      dialogProps: {
        messages: selectState(dialog, ownProps, 'messages') || [],
        text: selectState(dialog, ownProps, 'text') || '',
        fileList: (selectState(dialog, ownProps, 'filePaths') || []).map(fileMapper),
        online: getUserOnline(chatList, ownProps),
        username: state.settings.login.username,
      },
      id: getIDObj(chatList, ownProps),
      files: selectState(filePanel, ownProps) || {},
    }
  },
  dispatch => ({
    dialogActions: bindActionCreators(actions.dialogActions, dispatch),
    filePanelActions: bindActionCreators(actions.filePanelActions, dispatch),
  })
)
class Chatting extends Component {
  render() {
    const { dialogActions, files, filePanelActions, id, dialogProps } = this.props
    return (
      <div>
        <Dialog {...dialogActions} {...dialogProps} id={id}>
          <FilePanel {...filePanelActions} files={files} id={id} />
        </Dialog>
      </div>
    )
  }
}

export default Chatting

function selectState(state, ownProps, fleid) {
  const { type, key } = ownProps.match.params
  if (!type) return null
  if (!fleid) return state[type][key]
  if (!state[type][key]) return null
  return state[type][key][fleid]
}

function getIDObj(chatListState, ownProps) {
  const { type, key } = ownProps.match.params
  const id = { type, key }
  if (!type) {
    id.tags = []
  } else if (type === 'channel' && chatListState.channels[key]) {
    id.tags = Object.keys(chatListState.channels[key].users)
    id.channel = key
  } else if (type === 'user') {
    id.tags = [key]
  }
  return id
}

function getUserOnline(chatListState, ownProps) {
  const { type, key } = ownProps.match.params
  if (!type || type !== 'user') return true
  return chatListState.users[key] ? chatListState.users[key].online : false
}
