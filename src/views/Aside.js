import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ChatList from '../components/Aside/ChatList'
import { chatListActions, selectors } from './AsideRedux'

@connect(
  state => ({
    chatList: state.aside.chatList,
    chattingID: selectors.selectChattingID(state) || {},
  }),
  dispatch => ({
    chatListActions: bindActionCreators(chatListActions, dispatch),
  })
)
class Aside extends Component {
  render() {
    const { chatList, chatListActions: actions } = this.props
    const { chattingID } = this.props
    return (
      <div>
        <ChatList {...chatList} {...actions} current={chattingID} />
      </div>
    )
  }
}

export default Aside
