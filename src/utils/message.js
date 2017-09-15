import { message } from 'antd'

export function showError(error) {
  if (error && typeof error === 'object') {
    message.error(error.message)
    console.error(error.stack) // eslint-disable-line
  } else if (typeof error === 'string') {
    message.error(error)
  }
}

export function showInfo(msg) {
  message.info(msg)
}
