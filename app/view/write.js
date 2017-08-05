/* eslint-disable no-param-reassign */

const dateFormat = require('dateformat')
const formatTag = require('./formatTag')
const escapeHTML = require('escape-html')

module.exports = (view) => {
  const write = (str, node) => {
    (node || view).insertAdjacentHTML('beforeend', str)
    if (node) return
    setTimeout(() => {
      view.scrollTop = view.scrollHeight
    }, 0)
  }

  const writeMonthDay = () => {
    write(`<section class="info center">${dateFormat(new Date(), 'mm-dd')}</section>`)
  }

  const writeMsg = (text, node, escape = false) => {
    write(`<section class="info">${escape ? escapeHTML(text) : text}</section>`, node)
  }

  const writeErrorMsg = (text) => {
    write(`<section class="info error">${escapeHTML(text)}</section>`)
  }

  const writeUserMsg = (tag, username, text) => {
    write(
      `<section><span class="info">${dateFormat(new Date(), 'HH:MM')} - ${escapeHTML(
        username
      )}[${formatTag(tag)}] :</span>${escapeHTML(text)}</section>`
    )
  }

  return {
    write,
    writeMonthDay,
    writeMsg,
    writeUserMsg,
    writeErrorMsg,
  }
}
