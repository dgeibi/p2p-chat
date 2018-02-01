import ipRegex from 'ip-regex'

export const validPort = (rule, value, callback) => {
  const port = Number(value)
  if (Number.isNaN(port) || !Number.isInteger(port) || port < 2000 || port > 59999) {
    callback(Error('Port should be a integer (2000~59999)'))
    return
  }
  callback()
}

export const validAddress = (rule, value, callback) => {
  if (!value || ipRegex({ exact: true }).test(value)) {
    callback()
  } else {
    callback(Error(`${value} is not a regular IP`))
  }
}

export const validName = (rule, value, callback) => {
  if (!/\s/.test(value)) {
    callback()
  } else {
    callback(Error('should not contain white space'))
  }
}
