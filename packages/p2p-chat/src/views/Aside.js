import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { createSelector } from 'reselect'
import { matchPath } from 'react-router-dom'
import { sortBy } from 'lodash'
import { getInfo } from '../selectors/chatInfo'

import ChatList from '../components/Aside/ChatList'
import { chatListActions } from './AsideRedux'

const byOnline = key => x => {
  const prefix = x.online ? '0' : '1'
  return prefix + x[key]
}
const selectUsers = state => state.aside.chatList.users
const selectChannels = state => state.aside.chatList.channels
const selectSortedChannels = createSelector(
  [selectUsers, selectChannels],
  (users, channels) =>
    sortBy(
      Object.keys(channels).map(key => getInfo(users, channels, 'channel', key)),
      byOnline('name')
    )
)
const selectSortedUsers = createSelector([selectUsers], users =>
  sortBy(Object.values(users), byOnline('username'))
)

const selectLocation = state => state.routing.location
const selectCurrent = createSelector([selectLocation], location => {
  if (!location) return {}
  const match = matchPath(location.pathname, {
    path: '/chat/:type/:key',
  })
  if (match) return match.params
  return {}
})

@connect(
  state => ({
    chatList: {
      visible: state.aside.chatList.visible,
      users: selectSortedUsers(state),
      channels: selectSortedChannels(state),
      current: selectCurrent(state),
    },
  }),
  dispatch => ({
    chatListActions: bindActionCreators(chatListActions, dispatch),
  })
)
class Aside extends Component {
  static propTypes = {
    chatList: PropTypes.object.isRequired,
    chatListActions: PropTypes.object.isRequired,
  }

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
