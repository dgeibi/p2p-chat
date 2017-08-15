import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import ChatList from '../components/Aside/ChatList'
import { chatListActions } from './AsideRedux'

@connect(
  state => ({
    chatList: state.aside.chatList,
  }),
  dispatch => ({
    chatListActions: bindActionCreators(chatListActions, dispatch),
  })
)
class Aside extends Component {
  render() {
    const { chatList, chatListActions: actions } = this.props
    return (
      <div>
        <ChatList {...chatList} {...actions} />
      </div>
    )
  }
}

export default Aside
