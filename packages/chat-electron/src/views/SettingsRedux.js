import { combineReducers } from 'redux'

import login, * as loginActions from '../components/Settings/LoginRedux'

export default combineReducers({ login })
export { loginActions }
