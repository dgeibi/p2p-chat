/* eslint-disable no-console */
const chalk = require('chalk')
const util = require('util')

const colors = {
  log: null,
  verbose: 'cyan',
  info: 'green',
  warn: 'yellow',
  debug: 'blue',
  error: 'red',
}

const aliases = {
  err: 'error',
}

const mapFn = arg => (typeof arg === 'function' ? String(arg) : arg)

const log = color => (...args) => {
  const str = util.format(...args.map(mapFn))
  if (color !== null) {
    console.log(chalk[color](str))
  } else {
    console.log(str)
  }
}

const logger = {}

Object.keys(colors).forEach((x) => {
  logger[x] = log(colors[x])
})

Object.keys(aliases).forEach((x) => {
  logger[x] = logger[aliases[x]]
})

module.exports = logger
