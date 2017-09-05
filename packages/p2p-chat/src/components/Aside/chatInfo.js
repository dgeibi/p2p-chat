import has from 'p2p-chat-utils/has'
import pickBy from 'p2p-chat-utils/pickBy'

const pickProps = (stub, src) => pickBy(src, (value, key) => has(stub, key))

export const getChannelOnlineMembers = (members, users) =>
  Object.values(users ? pickProps(members, users) : members).filter(x => x.online)

export const getInfo = ({ users, channels }, { type, key }) => {
  if (type === 'user') return users[key]
  if (type === 'channel') {
    const channel = { ...channels[key] }
    channel.users = pickProps(channel.users, users)
    channel.onlineCount = getChannelOnlineMembers(channel.users).length
    channel.online = channel.onlineCount > 0
    channel.totalCount = Object.keys(channel.users).length
    return channel
  }
  return null
}
