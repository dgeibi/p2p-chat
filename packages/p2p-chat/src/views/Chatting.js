import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { basename } from 'path'
import { createSelector } from 'reselect'
import PropTypes from 'prop-types'

import Dialog from '../components/Chatting/Dialog'
import FilePanel from '../components/Chatting/FilePanel'
import { selectInfo } from '../selectors/chatInfo'
import * as actions from './ChattingRedux'

const emptyArray = []
const emptyObject = {}

function select(state, ownProps, fleid) {
  const { type, key } = ownProps.match.params
  if (!type) return null
  if (!fleid) return state[type][key]
  if (!state[type][key]) return null
  return state[type][key][fleid]
}

const selectType = (state, props) => props.match.params.type
const selectKey = (state, props) => props.match.params.key

const selectChannelUsers = (state, props) => {
  if (props.match.params.type !== 'channel') return null
  return state.aside.chatList.channels[props.match.params.key].users
}

const selectID = createSelector(
  [selectType, selectKey, selectChannelUsers],
  (type, key, users) => {
    if (type === 'channel') {
      return {
        type,
        key,
        tags: Object.keys(users),
        channel: key,
      }
    } else if (type === 'user') {
      return {
        type,
        key,
        tags: [key],
      }
    }
    return null
  }
)

const fileMapper = filepath => ({
  uid: filepath,
  path: filepath,
  name: basename(filepath),
})

const selectFilePaths = (state, props) =>
  select(state.chatting.dialog, props, 'filePaths')
const selectFileList = createSelector([selectFilePaths], filePaths => {
  if (!filePaths) return emptyArray
  return filePaths.map(fileMapper)
})

@connect(
  (state, ownProps) => {
    const { dialog, filePanel } = state.chatting
    return {
      dialogProps: {
        username: state.settings.login.username,
        messages: select(dialog, ownProps, 'messages') || emptyArray,
        text: select(dialog, ownProps, 'text') || '',
        fileList: selectFileList(state, ownProps),
        info: selectInfo(state, ownProps),
      },
      id: selectID(state, ownProps),
      files: select(filePanel, ownProps) || emptyObject,
    }
  },
  dispatch => ({
    dialogActions: bindActionCreators(actions.dialogActions, dispatch),
    filePanelActions: bindActionCreators(actions.filePanelActions, dispatch),
  })
)
class Chatting extends Component {
  static propTypes = {
    dialogActions: PropTypes.object.isRequired,
    files: PropTypes.object.isRequired,
    filePanelActions: PropTypes.object.isRequired,
    id: PropTypes.object.isRequired,
    dialogProps: PropTypes.object.isRequired,
  }
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
