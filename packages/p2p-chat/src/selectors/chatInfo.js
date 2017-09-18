import { createSelector, defaultMemoize } from 'reselect'
import pickBy from 'p2p-chat-utils/pickBy'
import has from 'p2p-chat-utils/has'

const pickProps = (stub, src) => pickBy(src, (value, key) => has(stub, key))

const getChannelOnlineMembers = (members, users) =>
  Object.values(users ? pickProps(members, users) : members).filter(x => x.online)

const getChannelInfo = defaultMemoize((channels, users, key) => {
  const channel = { ...channels[key] }
  channel.users = pickProps(channel.users, users)
  channel.onlineCount = getChannelOnlineMembers(channel.users).length
  channel.online = channel.onlineCount > 0
  channel.totalCount = Object.keys(channel.users).length
  return channel
})

const getInfo = (users, channels, type, key) => {
  if (type === 'user') return users[key]
  if (type === 'channel') return getChannelInfo(channels, users, key)
  return null
}

const usersSelector = state => state.aside.chatList.users
const channelsSelector = state => state.aside.chatList.channels
const typeSelector = (state, ownProps) => ownProps.match.params.type
const keySelector = (state, ownProps) => ownProps.match.params.key

const selectInfo = createSelector(
  [usersSelector, channelsSelector, typeSelector, keySelector],
  getInfo
)

export { getInfo, selectInfo }
