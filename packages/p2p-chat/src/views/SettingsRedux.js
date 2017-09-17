import { combineReducers } from 'redux'

import login, * as loginActions from '../components/Settings/Login/redux'

export default combineReducers({ login })
export { loginActions }
