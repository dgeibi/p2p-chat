import React from 'react'
import dateFormat from 'dateformat'
import PropTypes from 'prop-types'

import { formatTag } from '../../../utils/format'

import './Text.scss'

const Text = ({ username, text, myName, self, date, tag }) => (
  <div styleName="text">
    <header styleName="text__header">{self ? myName : username + formatTag(tag)}</header>
    <main styleName="text__main">{text}</main>
    <footer styleName="text__footer">{dateFormat(date, 'yyyy-mm-dd HH:MM')}</footer>
  </div>
)

Text.propTypes = {
  text: PropTypes.string.isRequired,
  date: PropTypes.number.isRequired,
  username: PropTypes.string,
  self: PropTypes.bool,
  myName: PropTypes.string,
  tag: PropTypes.string,
}

export default Text
