const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)
const getChannelMembers = (members, users) =>
  Object.keys(users).reduce((o, k) => {
    if (has(members, k)) {
      o[k] = users[k] // eslint-disable-line no-param-reassign
    }
    return o
  }, {})

export const getChannelOnlineMembers = (members, users) =>
  Object.values(users ? getChannelMembers(members, users) : members).filter(x => x.online)

export const getInfo = ({ users, channels }, { type, key }) => {
  if (type === 'user') return users[key]
  if (type === 'channel') {
    const channel = { ...channels[key] }
    channel.users = getChannelMembers(channel.users, users)
    channel.onlineCount = getChannelOnlineMembers(channel.users).length
    channel.online = channel.onlineCount > 0
    channel.totalCount = Object.keys(channel.users).length
    return channel
  }
  return null
}
