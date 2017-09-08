import { getInfo } from '../Aside/chatInfo'

export default (state, ownProps) => {
  const { type, key } = ownProps.match.params
  const { users, channels } = state.aside.chatList
  return getInfo({ users, channels }, { type, key })
}
