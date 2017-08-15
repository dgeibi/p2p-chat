import { combineReducers } from 'redux'

import login, * as loginAction from '../components/Settings/LoginRedux'

export default combineReducers({ login })
export { loginAction }
