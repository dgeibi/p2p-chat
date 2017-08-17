import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { matchPath } from 'react-router'
import ChatList from '../components/Aside/ChatList'
import { chatListActions } from './AsideRedux'

@connect(
  state => ({
    chatList: state.aside.chatList,
    routing: state.routing,
  }),
  dispatch => ({
    chatListActions: bindActionCreators(chatListActions, dispatch),
  })
)
class Aside extends Component {
  render() {
    const { chatList, chatListActions: actions } = this.props
    const { routing } = this.props
    const match = routing.location
      ? matchPath(routing.location.pathname, {
        path: '/dialog/:type/:key',
      })
      : null
    const current = match
      ? match.params
      : {}
    return (
      <div>
        <ChatList {...chatList} {...actions} current={current} />
      </div>
    )
  }
}

export default Aside
