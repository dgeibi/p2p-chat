import { message } from 'antd'

export function showError(errMsg) {
  message.error(errMsg)
}

export function showInfo(msg) {
  message.info(msg)
}
